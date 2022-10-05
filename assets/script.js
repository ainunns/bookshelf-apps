const bookshelf = [];
const RENDER_EVENT = 'render-bookshelf';
const SAVED_EVENT = 'saved-todo';
const STORAGE_KEY = 'TODO_APPS';

function generateId(){
	return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
	return {
		id,
		title,
		author,
		year,
		isComplete
	}
}

function isStorageExist() {
	if(typeof (Storage) === undefined) {
		alert('Browser kamu tidak mendukung local storage');
		return false;
	}
	return true;
}

function saveData() {
	if(isStorageExist()) {
		const parsed = JSON.stringify(bookshelf);
		localStorage.setItem(STORAGE_KEY, parsed);
		document.dispatchEvent(new Event(SAVED_EVENT));
	}
}

function loadDataFromStorage() {
	const serializedData = localStorage.getItem(STORAGE_KEY);
	let data = JSON.parse(serializedData);

	if(data !== null) {
		for(const book of data) {
			bookshelf.push(book);
		}
	}

	document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener(SAVED_EVENT, function () {
	alert('Data rak buku telah diperbaharui!');
});

function findBook(bookId) {
	for(const bookItem of bookshelf){
		if(bookItem.id === bookId){
			return bookItem;
		}
	}
	return null;
}

function addBookToCompleted(bookId) {
	const bookTarget = findBook(bookId);

	if(bookTarget == null){
		return;
	}

	bookTarget.isComplete = true;
	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
}

function findBookIndex(bookId) {
	for(const index in bookshelf) {
		if(bookshelf[index].id === bookId){
			return index;
		}
	}
	return -1;
}

function removeBookFromCompleted(bookId) {
	const bookTarget = findBookIndex(bookId);
	
	if(bookTarget === -1) {
		return;
	}

	bookshelf.splice(bookTarget, 1);
	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
}

function undoBookFromCompleted(bookId) {
	const bookTarget = findBook(bookId);

	if(bookTarget == null){
		return;
	}

	bookTarget.isComplete = false;
	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
}

function editBookShelfData(bookId) {
	const bookTarget = findBookIndex(bookId);

	if(bookTarget == null) {
		return;
	}

	bookshelf[bookTarget].title = prompt('Silahkan edit judul buku yang ingin Anda ubah', `${bookshelf[bookTarget].title}`);
	bookshelf[bookTarget].author = prompt('Silahkan edit penulis buku yang ingin Anda ubah', `${bookshelf[bookTarget].author}`);
	bookshelf[bookTarget].year = prompt('Silahkan edit judul buku yang ingin Anda ubah', `${bookshelf[bookTarget].year}`);
	saveData();
	alert('Halaman akan segera direfresh');
	window.location.reload();
}

function makeBookShelf(bookObject) {
	const container = document.createElement('article');
	container.classList.add('book_item');
	container.setAttribute('id', `bookshelf-${bookObject.id}`);

	const textTitle = document.createElement('h3');
	textTitle.innerText = bookObject.title;
	container.append(textTitle);

	const textAuthor = document.createElement('p');
	textAuthor.innerText = 'Penulis : ' + bookObject.author;
	container.append(textAuthor);

	const textYear = document.createElement('p');
	textYear.innerText = 'Tahun Terbit : ' + bookObject.year;
	container.append(textYear);

	const action = document.createElement('div');
	action.classList.add('action');
	
	const undoButton = document.createElement('button');
	undoButton.classList.add('green');

	if(bookObject.isComplete) {
		undoButton.innerText = 'Belum selesai di Baca';

		undoButton.addEventListener('click', function () {
			undoBookFromCompleted(bookObject.id);
		});
	} else {
		undoButton.innerText = 'Selesai dibaca';

		undoButton.addEventListener('click', function () {
			addBookToCompleted(bookObject.id);
		});
	}

	const trashButton = document.createElement('button');
	trashButton.classList.add('red');
	trashButton.innerText = 'Hapus buku';

	trashButton.addEventListener('click', function () {
		const response = confirm(`Anda yakin ingin menghapus ${bookObject.title}?`);
		if(response){
			removeBookFromCompleted(bookObject.id);
		}
	});

	const editButton = document.createElement('button');
	editButton.classList.add('blue');
	editButton.innerText = 'Edit buku';

	editButton.addEventListener('click', function () {
		editBookShelfData(bookObject.id);
	});

	action.append(editButton, undoButton, trashButton);
	container.append(action);

	return container;
}

function addBook() {
	const textTitle = document.getElementById('inputBookTitle').value;
	const textAuthor = document.getElementById('inputBookAuthor').value;
	const textYear = document.getElementById('inputBookYear').value;
	const boolCompleted = document.getElementById('inputBookIsComplete').checked;

	const generateID = generateId();
	const bookObject = generateBookObject(generateID, textTitle, textAuthor, textYear, boolCompleted);
	bookshelf.push(bookObject);

	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
}

function searching(bookTitle) {
	for(const index in bookshelf) {
		if(bookshelf[index].title == bookTitle) {
			return index;
		}
	}
	return -1;
}

function searchBook() {
	const findBookTitle = document.getElementById('searchBookTitle').value;
	const bookFoundAtIndex = searching(findBookTitle);
	let message = `Buku dengan judul \"${findBookTitle}\"`;

	if(bookFoundAtIndex != -1) {
		if(bookshelf[bookFoundAtIndex].isComplete) {
			alert(message + ' ditemukan dalam rak \"Selesai dibaca\"');
		} else {
			alert(message + ' ditemukan dalam rak \"Belum selesai dibaca\"');
		}
	} else {
		alert(message + ' tidak ada dalam rak buku manapun')
	}
}

document.addEventListener('DOMContentLoaded', function () {
	const submitForm = document.getElementById('inputBook');
	submitForm.addEventListener('submit', function (event) {
		event.preventDefault();
		addBook();
	});

	const searchBookForm = document.getElementById('searchBook');
	searchBookForm.addEventListener('submit', function (event) {
		event.preventDefault();
		searchBook();
	});

	if(isStorageExist()) {
		loadDataFromStorage();
	}
});

document.addEventListener(RENDER_EVENT, function () {
	const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
	incompleteBookshelfList.innerHTML = '';

	const completeBookshelfList = document.getElementById('completeBookshelfList');
	completeBookshelfList.innerHTML = '';

	for(const bookshelfItem of bookshelf){
		const bookElement = makeBookShelf(bookshelfItem);
		if(bookshelfItem.isComplete){
			completeBookshelfList.append(bookElement);
		} else {
			incompleteBookshelfList.append(bookElement);
		}
	}
});

document.addEventListener('change', function () {
	const isChecked = document.getElementById('inputBookIsComplete').checked;
	const shelf = document.getElementById('shelf');
	if(isChecked) {
		shelf.innerText = 'Selesai dibaca';
	} else {
		shelf.innerText = 'Belum selesai dibaca';
	}
});