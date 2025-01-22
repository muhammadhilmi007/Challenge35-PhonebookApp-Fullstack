// /**
//  * Contact Context Provider
//  * 
//  * Manages the global state for contacts with features:
//  * - Contact loading and pagination
//  * - Search and sort functionality
//  * - Offline support
//  * - Contact CRUD operations
//  */

// import React, { createContext, useContext, useReducer } from 'react';
// import { contactReducer, ACTIONS } from '../hooks/Reducer';
// import { api } from '../services/api';

// // Create context
// const ContactContext = createContext();

// /**
//  * Custom hook to use contact context
//  * @returns {Object} Contact context value
//  * @throws {Error} If used outside ContactProvider
//  */
// export function useContactContext() {
//   const context = useContext(ContactContext);
//   if (!context) {
//     throw new Error('useContactContext must be used within a ContactProvider');
//   }
//   return context;
// }

// /**
//  * Contact Provider Component
//  * 
//  * @param {Object} props
//  * @param {React.ReactNode} props.children - Child components
//  */
// export function ContactProvider({ children }) {
//   // Initialize state with session storage values
//   const [state, dispatch] = useReducer(contactReducer, {
//     contacts: [],
//     loading: false,
//     error: null,
//     page: 1,
//     hasMore: true,
//     sortBy: sessionStorage.getItem('contactSortBy') || 'name',
//     sortOrder: sessionStorage.getItem('contactSortOrder') || 'asc',
//     search: sessionStorage.getItem('searchActive')
//       ? sessionStorage.getItem('contactSearch') || ''
//       : '',
//     isOffline: false
//   });

//   /**
//    * Load contacts with pagination and offline support
//    * @param {boolean} loadMore - Whether to load more contacts or reset
//    */
//   const loadContacts = async (loadMore = false) => {
//     if (state.loading) return;

//     dispatch({ type: ACTIONS.SET_LOADING, payload: true });

//     try {
//       const page = loadMore ? state.page + 1 : 1;
//       const limit = 10;

//       // Get pending contacts and existing contacts from sessionStorage
//       const pendingContacts = JSON.parse(sessionStorage.getItem('pendingContacts') || '[]');
//       const existingContacts = JSON.parse(sessionStorage.getItem('existingContacts') || '[]');
      
//       try {
//         const response = await api.getContacts(
//           page,
//           limit,
//           state.sortBy,
//           state.sortOrder,
//           state.search
//         );

//         if (Array.isArray(response.phonebooks)) {
//           // Save server contacts to sessionStorage
//           if (!loadMore) {
//             sessionStorage.setItem('existingContacts', JSON.stringify(response.phonebooks));
//           } else {
//             const currentExisting = JSON.parse(sessionStorage.getItem('existingContacts') || '[]');
//             sessionStorage.setItem('existingContacts', JSON.stringify([...currentExisting, ...response.phonebooks]));
//           }
          
//           if (loadMore) {
//             // For infinite scroll, add new contacts and resort
//             const allContacts = [...state.contacts, ...response.phonebooks];
//             const sortedContacts = sortAndFilterContacts(allContacts);
            
//             dispatch({
//               type: ACTIONS.SET_CONTACTS,
//               payload: sortedContacts,
//             });
//           } else {
//             // For initial load, combine all contacts and sort
//             const allContacts = [...pendingContacts, ...response.phonebooks];
//             const sortedContacts = sortAndFilterContacts(allContacts);

//             dispatch({
//               type: ACTIONS.SET_CONTACTS,
//               payload: sortedContacts,
//             });
//           }

//           dispatch({
//             type: ACTIONS.SET_HAS_MORE,
//             payload: page < response.pages,
//           });
//           dispatch({ type: ACTIONS.SET_PAGE, payload: page });
//           dispatch({ type: ACTIONS.SET_OFFLINE, payload: false });
//         }
//       } catch (error) {
//         console.log('Server unavailable, using sessionStorage data');
        
//         // Get the full list of contacts
//         const allContacts = [...pendingContacts, ...existingContacts];
//         const sortedContacts = sortAndFilterContacts(allContacts);
        
//         if (!loadMore) {
//           // For initial load in offline mode
//           const initialBatch = sortedContacts.slice(0, limit);
//           dispatch({
//             type: ACTIONS.SET_CONTACTS,
//             payload: initialBatch,
//           });
          
//           // Store remaining contacts for infinite scroll
//           sessionStorage.setItem('remainingOfflineContacts', 
//             JSON.stringify(sortedContacts.slice(limit))
//           );
          
//           // Set hasMore if there are more contacts
//           dispatch({ 
//             type: ACTIONS.SET_HAS_MORE, 
//             payload: sortedContacts.length > limit 
//           });
//         } else {
//           // For infinite scroll in offline mode
//           const remainingContacts = JSON.parse(
//             sessionStorage.getItem('remainingOfflineContacts') || '[]'
//           );
          
//           if (remainingContacts.length > 0) {
//             // Get next batch
//             const nextBatch = remainingContacts.slice(0, limit);
//             const newRemaining = remainingContacts.slice(limit);
            
//             // Combine with existing contacts
//             const updatedContacts = [...state.contacts, ...nextBatch];
//             dispatch({
//               type: ACTIONS.SET_CONTACTS,
//               payload: updatedContacts,
//             });
            
//             // Update remaining contacts
//             sessionStorage.setItem('remainingOfflineContacts', 
//               JSON.stringify(newRemaining)
//             );
            
//             // Update hasMore
//             dispatch({ 
//               type: ACTIONS.SET_HAS_MORE, 
//               payload: newRemaining.length > 0 
//             });
            
//             // Update page
//             dispatch({ 
//               type: ACTIONS.SET_PAGE, 
//               payload: page 
//             });
//           } else {
//             dispatch({ type: ACTIONS.SET_HAS_MORE, payload: false });
//           }
//         }
        
//         dispatch({ type: ACTIONS.SET_OFFLINE, payload: true });
//       }
//     } catch (err) {
//       dispatch({ type: ACTIONS.SET_ERROR, payload: err.message });
//       console.error('Failed to load contacts:', err);
//     }

//     dispatch({ type: ACTIONS.SET_LOADING, payload: false });
//   };

//   /**
//    * Add a contact to pending list
//    * @param {Object} contact - Contact to add
//    */
//   const addPendingContact = (contact) => {
//     const pendingContacts = JSON.parse(sessionStorage.getItem('pendingContacts') || '[]');
//     const newContact = {
//       ...contact,
//       id: `pending_${Date.now()}`,
//       status: 'pending'
//     };
//     pendingContacts.unshift(newContact);
//     sessionStorage.setItem('pendingContacts', JSON.stringify(pendingContacts));
//     return newContact;
//   };

//   /**
//    * Helper function to sort and filter contacts
//    * @param {Array} contacts - Array of contacts to sort and filter
//    * @returns {Array} Sorted and filtered contacts
//    */
//   const sortAndFilterContacts = (contacts) => {
//     // First sort the contacts
//     const sortedContacts = [...contacts].sort((a, b) => {
//       const aValue = (a[state.sortBy] || '').toString().toLowerCase();
//       const bValue = (b[state.sortBy] || '').toString().toLowerCase();
//       const compareResult = aValue.localeCompare(bValue);
//       return state.sortOrder === 'asc' ? compareResult : -compareResult;
//     });

//     // Then filter if search is active
//     if (state.search) {
//       const searchTerm = state.search.toLowerCase();
//       return sortedContacts.filter(contact => 
//         contact.name.toLowerCase().includes(searchTerm) ||
//         contact.phone.toLowerCase().includes(searchTerm)
//       );
//     }

//     return sortedContacts;
//   };

//   /**
//    * Handle contact search
//    * @param {string} value - Search query
//    */
//   const handleSearch = (value) => {
//     dispatch({ type: ACTIONS.UPDATE_SEARCH, payload: value });
//     if (value) {
//       sessionStorage.setItem('contactSearch', value);
//       sessionStorage.setItem('searchActive', 'true');
//     } else {
//       sessionStorage.removeItem('contactSearch');
//       sessionStorage.removeItem('searchActive');
//     }
//   };

//   /**
//    * Handle contact sorting
//    * @param {string} field - Field to sort by
//    * @param {string} order - Sort order ('asc' or 'desc')
//    */
//   const handleSort = (field, order) => {
//     sessionStorage.setItem('contactSortBy', field);
//     sessionStorage.setItem('contactSortOrder', order);
//     dispatch({
//       type: ACTIONS.UPDATE_SORT,
//       payload: { sortBy: field, sortOrder: order },
//     });
//   };

//   /**
//    * Handle contact edit
//    * @param {string} id - Contact ID
//    * @param {Object} updatedContact - Updated contact data
//    */
//   const handleEdit = async (id, updatedContact) => {
//     try {
//       const currentContact = state.contacts.find(c => c.id === id);
//       const contactToUpdate = {
//         ...updatedContact,
//         photo: currentContact?.photo || updatedContact.photo || null
//       };

//       await api.updateContact(id, contactToUpdate);
      
//       let newContacts = state.contacts.map((contact) =>
//         contact.id === id ? { ...contactToUpdate, id } : contact
//       );

//       // Remove from list if it no longer matches search
//       if (state.search) {
//         const match =
//           contactToUpdate.name.toLowerCase().includes(state.search.toLowerCase()) ||
//           contactToUpdate.phone.toLowerCase().includes(state.search.toLowerCase());
//           handleRefreshContacts();
//         if (!match) {
//           newContacts = state.contacts.filter((contact) => contact.id !== id);
//         }
//       }
//       dispatch({ type: ACTIONS.SET_CONTACTS, payload: newContacts });
//     } catch (error) {
//       dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
//       console.error('Failed to update contact:', error);
//     }
//   };

//   /**
//    * Handle contact deletion
//    * @param {string} id - Contact ID
//    */
//   const handleDelete = async (id) => {
//     try {
//       if (id && typeof id === 'string' && id.startsWith('pending_')) {
//         // Remove from pending contacts in sessionStorage
//         const pendingContacts = JSON.parse(sessionStorage.getItem('pendingContacts') || '[]');
//         const updatedPending = pendingContacts.filter(contact => contact.id !== id);
//         sessionStorage.setItem('pendingContacts', JSON.stringify(updatedPending));
//       } else if (id) {
//         try {
//           await api.deleteContact(id);
//           // If successful, also remove from cached contacts
//           const cachedContacts = JSON.parse(sessionStorage.getItem('existingContacts') || '[]');
//           const updatedCached = cachedContacts.filter(contact => contact.id !== id);
//           sessionStorage.setItem('existingContacts', JSON.stringify(updatedCached));
//         } catch (error) {
//           if (state.isOffline) {
//             // If offline, just remove from cached contacts
//             const cachedContacts = JSON.parse(sessionStorage.getItem('existingContacts') || '[]');
//             const updatedCached = cachedContacts.filter(contact => contact.id !== id);
//             sessionStorage.setItem('existingContacts', JSON.stringify(updatedCached));
//           } else {
//             throw error;
//           }
//         }
//       }
      
//       // Update state
//       dispatch({ 
//         type: ACTIONS.SET_CONTACTS, 
//         payload: state.contacts.filter((contact) => contact.id !== id) 
//       });
//     } catch (error) {
//       dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
//       console.error('Failed to delete contact:', error);
//     }
//   };

//   /**
//    * Handle successful pending contact resend
//    * @param {string} pendingId - Pending contact ID
//    * @param {Object} savedContact - Successfully saved contact
//    */
//   const handleResendSuccess = async (pendingId, savedContact) => {
//     const updatedContacts = state.contacts.map(contact =>
//       contact.id === pendingId ? { 
//         ...savedContact,
//         id: savedContact._id || savedContact.id,
//         sent: true,
//         status: undefined 
//       } : contact
//     );
//     dispatch({ type: ACTIONS.SET_CONTACTS, payload: updatedContacts });
//   };

//   /**
//    * Refresh contact list
//    */
//   const handleRefreshContacts = () => {
//     dispatch({ type: ACTIONS.CLEAR_CONTACTS });
//     loadContacts(false);
//   };

//   // Context value
//   const value = {
//     state,
//     loadContacts,
//     handleSearch,
//     handleSort,
//     handleEdit,
//     handleDelete,
//     handleResendSuccess,
//     handleRefreshContacts,
//     addPendingContact
//   };

//   return (
//     <ContactContext.Provider value={value}>
//       {children}
//     </ContactContext.Provider>
//   );
// }
