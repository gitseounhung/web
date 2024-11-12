const photoGrid = document.getElementById("photoGrid");
const uploadModal = document.getElementById("uploadModal");
let imagePreview;

// 모달 열기 함수
function openUploadModal() {
    uploadModal.style.display = "flex";
}

// 모달 닫기 함수
function closeUploadModal() {
    uploadModal.style.display = "none";
    document.getElementById("titleInput").value = "";
    document.getElementById("descriptionInput").value = "";
    document.getElementById("fileInput").value = "";
    document.getElementById("tagsInput").value = "";
    imagePreview = null;
}

// 이미지 미리보기 함수
function previewImage(event) {
    const reader = new FileReader();
    reader.onload = function() {
        imagePreview = reader.result;
        document.getElementById("imagePreview").src = imagePreview; // 미리보기 이미지 업데이트
    };
    reader.readAsDataURL(event.target.files[0]);
}

// 사진 카드 추가 함수
async function addPhotoCard() {
    const title = document.getElementById("titleInput").value;
    const description = document.getElementById("descriptionInput").value;
    const tags = document.getElementById("tagsInput").value.split(',');

    

    // 새로운 사진 카드 요소 생성
    const photoCard = document.createElement("div");
    photoCard.classList.add("photo-card");

    const photoImage = document.createElement("div");
    photoImage.classList.add("photo-image");

    const img = document.createElement("img");
    img.src = imagePreview; // 이미지 미리보기 사용
    photoImage.appendChild(img);

    const photoInfo = document.createElement("div");
    photoInfo.classList.add("photo-info");

    const h3 = document.createElement("h3");
    h3.textContent = title;
    const p = document.createElement("p");
    p.textContent = description;

    // 태그 추가
    const tagContainer = document.createElement("div");
    tagContainer.classList.add("tags");
    tags.forEach(tag => {
        const tagElement = document.createElement("span");
        tagElement.classList.add("tag");
        tagElement.textContent = tag.trim();
        tagContainer.appendChild(tagElement);
    });

    // 좋아요 및 감정 표현 버튼
    const emotionButtons = document.createElement("div");
    emotionButtons.classList.add("emotion-buttons");
    
    const likeButton = document.createElement("button");
    likeButton.classList.add("emotion-button");
    likeButton.innerHTML = "❤️", 1
    likeButton.onclick = () => {
        alert(`${title}에 좋아요를 눌렀습니다!`);
    };

    const editButton = document.createElement("button");
    editButton.classList.add("emotion-button");
    editButton.innerHTML = "🖉 편집";
    editButton.onclick = () => {
        editPhotoCard(photoCard, title, description, tags);
    };

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("emotion-button");
    deleteButton.innerHTML = "❌ 삭제";
    deleteButton.onclick = () => {
        photoCard.remove();
        savePhotosToLocalStorage(); // 로컬 스토리지에 저장
    };

    emotionButtons.appendChild(likeButton);
    emotionButtons.appendChild(editButton);
    emotionButtons.appendChild(deleteButton);

    photoInfo.appendChild(h3);
    photoInfo.appendChild(p);
    photoInfo.appendChild(tagContainer);
    photoInfo.appendChild(emotionButtons);

    photoCard.appendChild(photoImage);
    photoCard.appendChild(photoInfo);

    photoGrid.appendChild(photoCard); // 갤러리에 추가

    closeUploadModal(); // 모달 닫기
    savePhotosToLocalStorage(); // 로컬 스토리지에 저장
}

// 서버에서 사진을 업로드하는 함수
async function uploadPhoto() {
    const title = document.getElementById("titleInput").value;
    const description = document.getElementById("descriptionInput").value;
    const tags = document.getElementById("tagsInput").value.split(',');
    const fileInput = document.getElementById("fileInput");

    if (!title || !description || !fileInput.files[0]) {
        alert("모든 필드를 입력하고 이미지를 업로드해 주세요.");
        return;
    }

    const formData = new FormData();
    formData.append('photo', fileInput.files[0]);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('tags', tags);

    try {
        const response = await fetch('http://localhost:3000/upload', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (response.ok) {
            alert("사진이 성공적으로 업로드되었습니다!");
            displayPhotoCard(data); // 화면에 업로드된 사진을 표시
            closeUploadModal();
        } else {
            alert(data.message || '업로드 실패');
        }
    } catch (error) {
        console.error('Error uploading photo:', error);
    }
}

// 서버에서 받아온 사진을 화면에 표시하는 함수
function displayPhotoCard(data) {
    const photoCard = document.createElement("div");
    photoCard.classList.add("photo-card");

    const photoImage = document.createElement("div");
    photoImage.classList.add("photo-image");

    const img = document.createElement("img");
    img.src = `http://localhost:3000${data.photoUrl}`; // 서버 주소와 URL 결합
    photoImage.appendChild(img);

    const photoInfo = document.createElement("div");
    const h3 = document.createElement("h3");
    h3.textContent = data.title;
    const p = document.createElement("p");
    p.textContent = data.description;

    const tagContainer = document.createElement("div");
    tagContainer.classList.add("tags");
    data.tags.forEach(tag => {
        const tagElement = document.createElement("span");
        tagElement.classList.add("tag");
        tagElement.textContent = tag;
        tagContainer.appendChild(tagElement);
    });

    photoInfo.appendChild(h3);
    photoInfo.appendChild(p);
    photoInfo.appendChild(tagContainer);

    photoCard.appendChild(photoImage);
    photoCard.appendChild(photoInfo);
    photoGrid.appendChild(photoCard);
}

// 사진 카드 편집 함수
function editPhotoCard(photoCard, title, description, tags) {
    document.getElementById("titleInput").value = title;
    document.getElementById("descriptionInput").value = description;
    document.getElementById("tagsInput").value = tags.join(", ");
    imagePreview = photoCard.querySelector("img").src; // 기존 이미지 미리보기

    // 기존 카드 삭제
    photoCard.remove();

    // 모달 열기
    openUploadModal();
}

// 로컬 스토리지에 사진 저장
function savePhotosToLocalStorage() {
    const photos = [];
    const cards = photoGrid.querySelectorAll(".photo-card");
    cards.forEach(card => {
        const img = card.querySelector("img").src;
        const title = card.querySelector("h3").innerText;
        const description = card.querySelector("p").innerText;
        const tags = Array.from(card.querySelectorAll(".tag")).map(tag => tag.innerText);
        photos.push({ img, title, description, tags });
    });
    localStorage.setItem("photos", JSON.stringify(photos));
}

// 페이지 로드 시 로컬 스토리지에서 사진 로드
window.onload = function() {
    const storedPhotos = JSON.parse(localStorage.getItem("photos")) || [];
    storedPhotos.forEach(photo => {
        imagePreview = photo.img; // 이미지 미리보기
        addPhotoCard(); // 카드 추가
    });
}

// 이벤트 리스너 설정
document.getElementById("fileInput").addEventListener("change", previewImage);
document.getElementById("uploadButton").addEventListener("click", uploadPhoto);
