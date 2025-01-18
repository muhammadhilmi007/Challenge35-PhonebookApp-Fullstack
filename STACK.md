Challenge #35 (Aplikasi Phonebook)
-------------------
Di tantangan kali ini, kita akan membuat daftar phonebook, untuk menyimpan nama dan nomor telepon serta foto orangnya. aplikasi ini memiliki fitur BREADS (Browse, Read, Edit, Add, Delete,
Sorting) serta dilengkapi pagination. disini kita akan membuat backend serta frontend yang dilengkapi test unit menggunakan mocha dan chai.

Resful API
-------------
buatlah endpointnya terlebih dahulu untuk aplikasi phonebook kalian, yang terdiri dari:

#1 READ, BROWSE, SORTING, PAGINATION
-------------
URL : http://localhost:3001/api/phonebooks
method : GET
Request : {
    "page": 1,
    "limit": 5,
    "sortBy": "name",
    "sortOrder": "asc",
    "name": ""
}
Response : {
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
            "name": "John Doe",
            "phone": "08123456789",
            "photo": "https://via.placeholder.com/150",
            "createdAt": "2018-10-10T00:00:00.000Z",
            "updatedAt": "2018-10-10T00:00:00.000Z"
        }
    ],
    "page": 1,
    "limit": 5,
    "pages": 21,
    "total": 6,
}

CODE : 200

#2 ADD
-------------
URL : http://localhost:3001/api/phonebooks
method : POST
Request : {
    "name": "John Doe",
    "phone": "08123456789"
}
Response : {
    "id": 56,
    "name": "John Doe",
    "phone": "08123456789",
    "photo": null,
    "createdAt": "2018-10-10T00:00:00.000Z",
    "updatedAt": "2018-10-10T00:00:00.000Z"
}
CODE : 201

#3 EDIT
-------------
URL : http://localhost:3001/api/phonebooks/:id
method : PUT
Request : {
    "name": "John Doe",
    "phone": "08123456789"
}
Response : {
    "id": 56,
    "name": "John Doe",
    "phone": "08123456789",
    "photo": null,
    "createdAt": "2018-10-10T00:00:00.000Z",
    "updatedAt": "2018-10-10T00:00:00.000Z"
}
CODE : 201

#4 DELETE
-------------
URL : http://localhost:3001/api/phonebooks/:id
method : DELETE
Request : {
    id: 56
}
Response : {
    "id": 56,
    "name": "John Doe",
    "phone": "08123456789",
    "photo": null,
    "createdAt": "2018-10-10T00:00:00.000Z",
    "updatedAt": "2018-10-10T00:00:00.000Z"
}

CODE : 200

#5 UPDATE AVATAR
-------------
URL : http://localhost:3001/api/phonebooks/:id/avatar
method : PUT
Request : {
    "photo": {avatar: file}
}
Response : {
    "id": 56,
    "name": "John Doe",
    "phone": "08123456789",
    "photo": "https://via.placeholder.com/150",
    "createdAt": "2018-10-10T00:00:00.000Z",
    "updatedAt": "2018-10-10T00:00:00.000Z"
}
CODE : 201

Client
-------------

Landing Page
terdiri dari :
1. Sorting Button
2. Searching Input
3. Adding Button
4. List

Web View
-------------
[Gambar Web View]
untuk tampilang web view, yang biasanya terlihat di browser kalau dibuka di monitor yang resolusinya cukup lebar.

Tab View
-------------
[Gambar Tab View]
untuk tampilang tab view, yang biasanya terlihat di sebuah layar pada device tab.

Mobile View
-------------
[Gambar Mobile View]
untuk tampilang mobile view, yang biasanya terlihat di sebuah layar pada device smartphone dengan maksimal resolusi 600px.

Searching Mode  
-------------
[Gambar Searching Mode]
input search ketika diketikkan keyword, otomatis list akan langsung berubah sesuai dengan keyword yang dimasukkan. gunakan event keyup untuk melakukan hal ini. contoh pada gambar, dimasukkan kata 'bu' sehingga sistem akan melakukan pencarian untuk kata yang dimasukkan di field name maupun phone, sehingga selain bisa dicari berdasarkan name bisa di cari juga berdasarkan phone, Gunakan OR untuk clause where di database postgresql.

Sorting Mode
-------------
[Gambar Sorting Mode]
Fitur Sorting dapat bekerja bersamaan dengan fitur searching. contoh pada gambar user sedang melakukan pencarian dengan keyword 'ra' disi kita melihat default sorting yakni ascending berdasarkan nama. dan apabila sorting untuk descending di klik, maka list akan mengurutkan berdasarkan nama dari belakang dan ingat fitur pencarian tetap berfungsi.

Pagination List
-------------
[Gambar Pagination Mode]
untuk fitur pagination gunakan addeventlistener scroll untuk melakukan load data halaman berikutnya. data halaman berikutnya langsung ditambahkan ke data sebelumnya. sehingga data akan bertambah ketika dilakukan scrolling sampai bawah.

Adding View
-------------
[Gambar Adding Mode]
Fitur Add View akan muncul ketika tombol add yang ada di landing page sebelah searching input diklik, maka tampilan landing page akan berpindah ke tampilan add-view. gunakan Router di Frontend untuk mengatur perpindahan halaman. dan apabila user menekan tombol save maka data akan tersimpan dan tampilan akan kembali ke landing page.

Editing View
-------------
[Gambar Editing Mode]
Fitur edit dapat dilakukan langsung di list yang ada di landing page, dan bisa dilakukan perubahaan secara bersamaan.

Deleting View
-------------
[Gambar Deleting Mode]
Untuk Fitur penghapusan, ketika icon untuk menghapus diklik, pastikan konfirmasi penghapusan keluar terlebih dahulu, "Apakah anda yakin ingin menghapus data ini ?". dan apabila user menekan tombol delete maka data akan terhapus.

Updating Avatar
-------------
[Gambar Updating Avatar Mode]
Pada Gambar diatas, gambar avatar dapat di klik dan langsung menuju fitur untuk mengupload avatarnya, untuk versi mobilenya user dapat memilih file atau langsung melakukan selfie menggunakan smartphone, apabila avatar belum diupdate, maka akan ada gambar user sebagai defaultnya, apabila gambar telah diupdate, maka akan keluar gambar yang sesuai dengan data di database. contoh seperti gambar diatas.

Test Unit
-------------
Buatlah beberapa test unit dengan menggunakan mocha dan chai untuk bagian backend, serta gunakan jest atau framework test lain yang kamu kuasai untuk unit testing frontend.

Keywords Tech Stack
-------------
1. Backend
2. Sequelize
3. Frontend
4. Mobile
5. React Native
6. React JS
7. Vue JS
8. Graphql
9. Mocha
10. Chai
11. Jest
12. Database PostgreSQL



## Error
1. Button Sort nya kebalik (solved)
2. Ketika Search data, dan terus edit data, maka data yang di edit tidak ada di list (solved)
3. Ketika Search data, dan klik button add data, maka keyword yang di form search tidak hilang (solved)
4. Ketika user klik update avatar, maka pindah ke halaman updateavatar
5. Ketika Search keyword: 'bo', kenapa muncul selain bo dan harus di produce.
6. Ketika update gambar, maka gambar yang sebelumnya terhapus juga di folder upload nya
7. Ketika Mode Search dan Sort, dan ketika posisi edit data seharusnya menyesuaikan dengan urutan asceding atau sebaliknya
8. Kalau mau deploy .env di gitignore, semua variable penting masukkin ke .env

