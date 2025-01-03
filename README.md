# Challenge35-Phonebook-App-ReactJS

## Challenge #35 (Aplikasi Phonebook)

Dalam tantangan ini, kita akan membuat aplikasi daftar phonebook untuk menyimpan nama, nomor telepon, dan foto kontak. Aplikasi ini akan memiliki fitur BREADS (Browse, Read, Edit, Add, Delete, Sorting) dengan pagination. Kita akan mengembangkan backend dan frontend, serta menerapkan unit testing menggunakan Mocha dan Chai.

## RESTful API

Berikut adalah endpoint-endpoint yang perlu dibuat untuk aplikasi phonebook:

### 1. READ, BROWSE, SORTING, PAGINATION

- **URL**: `http://localhost:3001/api/phonebooks`
- **Method**: GET
- **Request**:
  ```json
  {
    "page": 1,
    "limit": 5,
    "sortBy": "name",
    "sortOrder": "asc",
    "name": ""
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "phonebooks": [
      {
        "_id": 56,
        "name": "John Doe",
        "phone": "08123456789",
        "photo": "https://via.placeholder.com/150",
        "createdAt": "2018-10-10T00:00:00.000Z",
        "updatedAt": "2018-10-10T00:00:00.000Z"
      },
      {
        "_id": 54,
        "name": "Jane Smith",
        "phone": "08987654321",
        "photo": "https://via.placeholder.com/150",
        "createdAt": "2018-10-10T00:00:00.000Z",
        "updatedAt": "2018-10-10T00:00:00.000Z"
      }
    ],
    "page": 1,
    "limit": 5,
    "pages": 21,
    "total": 102
  }
  ```

### 2. ADD

- **URL**: `http://localhost:3001/api/phonebooks`
- **Method**: POST
- **Request**:
  ```json
  {
    "name": "John Doe",
    "phone": "08123456789"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "id": 56,
    "name": "John Doe",
    "phone": "08123456789",
    "photo": null,
    "createdAt": "2023-05-15T10:30:00.000Z",
    "updatedAt": "2023-05-15T10:30:00.000Z"
  }
  ```

### 3. EDIT

- **URL**: `http://localhost:3001/api/phonebooks/:id`
- **Method**: PUT
- **Request**:
  ```json
  {
    "name": "John Doe Updated",
    "phone": "08123456780"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "id": 56,
    "name": "John Doe Updated",
    "phone": "08123456780",
    "photo": null,
    "createdAt": "2023-05-15T10:30:00.000Z",
    "updatedAt": "2023-05-15T11:00:00.000Z"
  }
  ```

### 4. DELETE

- **URL**: `http://localhost:3001/api/phonebooks/:id`
- **Method**: DELETE
- **Response** (200 OK):
  ```json
  {
    "id": 56,
    "name": "John Doe",
    "phone": "08123456789",
    "photo": null,
    "createdAt": "2023-05-15T10:30:00.000Z",
    "updatedAt": "2023-05-15T10:30:00.000Z"
  }
  ```

### 5. UPDATE AVATAR

- **URL**: `http://localhost:3001/api/phonebooks/:id/avatar`
- **Method**: PUT
- **Request**: Multipart form data with "photo" field containing the image file
- **Response** (200 OK):
  ```json
  {
    "id": 56,
    "name": "John Doe",
    "phone": "08123456789",
    "photo": "https://example.com/uploads/john_doe_avatar.jpg",
    "createdAt": "2023-05-15T10:30:00.000Z",
    "updatedAt": "2023-05-15T12:00:00.000Z"
  }
  ```

## Client-side Features

### Landing Page
- Sorting Button
- Search Input
- Add Button
- Contact List

### Responsive Design
- Web View (Desktop)
- Tablet View
- Mobile View (max-width: 600px)

### Searching
Implement real-time search functionality using the `keyup` event. The search should filter contacts based on both name and phone number.

### Sorting
Allow sorting in ascending or descending order by name. Sorting should work in conjunction with the search feature.

### Pagination
Implement infinite scroll pagination. Load more contacts as the user scrolls to the bottom of the list.

### Adding Contacts
Provide a separate view for adding new contacts. Use React Router for navigation between views.

### Editing Contacts
Allow inline editing of contacts directly in the list view.

### Deleting Contacts
Implement a delete confirmation dialog before removing a contact.

### Updating Avatar
Allow users to update contact avatars by clicking on the image. On mobile, provide options to choose a file or take a selfie.

## Testing

### Backend
Use Mocha and Chai to create unit tests for the backend API endpoints.

### Frontend
Implement unit tests for React components using Jest or any preferred testing framework.

## Tech Stack

1. Backend: Node.js with Express
2. ORM: Sequelize
3. Frontend: React.js
4. Mobile: React Native (optional)
5. State Management: Redux or Context API
6. API: RESTful (with potential for GraphQL implementation)
7. Database: PostgreSQL
8. Testing: Mocha, Chai (backend), Jest (frontend)
9. Version Control: Git

By following this README, you'll create a full-stack Phonebook application with a robust backend API, responsive frontend, and comprehensive test coverage.
