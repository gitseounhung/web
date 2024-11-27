const photoGrid = document.getElementById("photoGrid");
const uploadModal = document.getElementById("uploadModal");
let imagePreview = null;
let isEditing = false;
let currentPhotoCard = null;


function openUploadModal() {
    uploadModal.style.display = "flex";
}

// 모달 닫기
function closeUploadModal() {
    uploadModal.style.display = "none";
    resetModalFields();
}

// 모달 필드 초기화
function resetModalFields() {
    document.getElementById("titleInput").value = "";
    document.getElementById("descriptionInput").value = "";
    document.getElementById("fileInput").value = "";
    document.getElementById("tagsInput").value = "";
    imagePreview = null;
    const imgPreviewElement = document.getElementById("imagePreview");
    imgPreviewElement.src = "";
}

// 이미지 미리보기 (업로드 모드)
function previewImage(event) {
    const reader = new FileReader();
    reader.onload = function() {
        imagePreview = reader.result;
        const imgPreviewElement = document.getElementById("imagePreview");
        imgPreviewElement.src = imagePreview;
    };
    reader.readAsDataURL(event.target.files[0]);
}

// 사진 카드 추가
function addPhotoCard() {
    openUploadModal()
    const title = document.getElementById("titleInput").value.trim();
    const description = document.getElementById("descriptionInput").value.trim();
    const tags = document.getElementById("tagsInput").value.split(',').map(tag => tag.trim());
    const imagePreview = document.getElementById("fileInput").files[0]; // 이미지 미리보기 확인
    
    if (!title || !description || !imagePreview) {
        showAlertModal("모든 필드를 입력하고 이미지를 업로드해 주세요.");
        return;
    }

    const photoCard = createPhotoCard(title, description, tags);

    const photoGrid = document.getElementById("photoGrid");
    if (photoGrid) {
        photoGrid.appendChild(photoCard);
    } else {
        console.error("photoGrid 요소를 찾을 수 없습니다.");
    }

    closeUploadModal();
    savePhotosToLocalStorage();
}

function showAlertModal(message) {
    const alertModal = document.getElementById("alertModal");
    const alertMessage = document.getElementById("alertMessage");
    alertMessage.textContent = message;
    alertModal.style.display = "block";
}

document.getElementById("closeAlertModal").onclick = function() {
    document.getElementById("alertModal").style.display = "none";
};

document.getElementById("confirmAlert").onclick = function() {
    document.getElementById("alertModal").style.display = "none";
};

window.onclick = function(event) {
    const alertModal = document.getElementById("alertModal");
    if (event.target == alertModal) {
        alertModal.style.display = "none";
    }
};

// 사진 카드 생성
function createPhotoCard(title, description, tags) {
    const photoCard = document.createElement("div");
    photoCard.classList.add("photo-card");

    const photoImage = document.createElement("div");
    photoImage.classList.add("photo-image");

    const img = document.createElement("img");
    img.src = imagePreview; // 이미지 소스 설정
    photoImage.appendChild(img);

    const photoInfo = document.createElement("div");
    photoInfo.classList.add("photo-info");

    const h3 = document.createElement("h3");
    h3.textContent = title;

    const p = document.createElement("p");
    p.textContent = description;

    const tagContainer = document.createElement("div");
    tagContainer.classList.add("tags");
    tags.forEach(tag => {
        const tagElement = document.createElement("span");
        tagElement.classList.add("tag");
        tagElement.textContent = tag;
        tagContainer.appendChild(tagElement);
    });

    const emotionButtons = createEmotionButtons(photoCard);

    photoInfo.appendChild(h3);
    photoInfo.appendChild(p);
    photoInfo.appendChild(tagContainer);
    photoInfo.appendChild(emotionButtons);

    photoCard.appendChild(photoImage);
    photoCard.appendChild(photoInfo);

    return photoCard;
}

// 감정 표현 버튼 생성
function createEmotionButtons(photoCard) {
    const emotionButtons = document.createElement("div");
    emotionButtons.classList.add("emotion-buttons");

    const likeButton = document.createElement("button");
    likeButton.classList.add("emotion-button");
    likeButton.innerHTML = `❤️ <span class="like-count">0</span>`;
    likeButton.onclick = () => {
        const likeCountElement = likeButton.querySelector(".like-count");
        let currentCount = parseInt(likeCountElement.innerText);
        likeCountElement.innerText = currentCount + 1;
    };

    const editButton = document.createElement("button");
    editButton.classList.add("emotion-button");
    editButton.innerHTML = "✏️ 편집";
    editButton.onclick = () => {
        openEditModal(photoCard);
    };

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("emotion-button");
    deleteButton.innerHTML = "❌ 삭제";
    deleteButton.onclick = () => {
        openDeleteConfirmModal(photoCard);
    };

    emotionButtons.appendChild(likeButton);
    emotionButtons.appendChild(editButton);
    emotionButtons.appendChild(deleteButton);

    return emotionButtons;
}

// 삭제 확인 모달 열기
function openDeleteConfirmModal(photoCard) {
    const deleteModal = document.getElementById("deleteConfirmModal");
    deleteModal.style.display = "block";

    // 확인 버튼 클릭 시
    document.getElementById("confirmDelete").onclick = () => {
        if (photoCard) {
            photoCard.remove(); // photoCard가 유효한 경우 삭제
            savePhotosToLocalStorage(); // 로컬 스토리지에 저장
            closeDeleteConfirmModal(); // 모달 닫기
        }
    };

    // 취소 버튼 클릭 시
    document.getElementById("cancelDelete").onclick = () => {
        closeDeleteConfirmModal();
    };
}

// 삭제 확인 모달 닫기
function closeDeleteConfirmModal() {
    document.getElementById("deleteConfirmModal").style.display = "none";
}

// 클릭 시 모달 닫기
window.onclick = function(event) {
    const deleteModal = document.getElementById("deleteConfirmModal");
    if (event.target == deleteModal) {
        closeDeleteConfirmModal();
    }
}



// 편집 모달 열기
// 편집 모달 열기
function openEditModal(photoCard) {
    isEditing = true; // 편집 모드 활성화
    currentPhotoCard = photoCard; // 현재 편집 중인 카드 저장

    const titleElement = photoCard.querySelector("h3");
    const descriptionElement = photoCard.querySelector("p");
    const tagElements = photoCard.querySelectorAll(".tag");
    const imgElement = photoCard.querySelector("img");

    if (!titleElement || !descriptionElement || !imgElement) {
        console.error("사진 카드의 필수 요소가 누락되었습니다.");
        return;
    }

    // 편집 모달의 입력 필드에 기존 데이터 채우기
    document.getElementById("editTitleInput").value = titleElement.textContent || "";
    document.getElementById("editDescriptionInput").value = descriptionElement.textContent || "";
    document.getElementById("editTagsInput").value = Array.from(tagElements).map(tag => tag.textContent).join(", ");
    document.getElementById("editImagePreview").src = imgElement.src || "";

    // 편집 모달 열기
    const editModal = document.getElementById("editModal");
    if (editModal) {
        editModal.style.display = "flex";
    }
}

function closeEditModal() {
    const editModal = document.getElementById("editModal");
    if (editModal) {
        editModal.style.display = "none"; // 모달 닫기
    }

    isEditing = false; // 편집 모드 비활성화
    currentPhotoCard = null; // 현재 편집 중인 카드 초기화
}
function previewEditImage(event) {
    const file = event.target.files[0];
    const imgPreview = document.getElementById("editImagePreview");
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imgPreview.src = e.target.result; // 미리보기 이미지 업데이트
        };
        reader.readAsDataURL(file);
    }
}

function saveEditedPhotoCard() {
    const title = document.getElementById("editTitleInput").value.trim();
    const description = document.getElementById("editDescriptionInput").value.trim();
    const tags = document.getElementById("editTagsInput").value
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
    const imageSrc = document.getElementById("editImagePreview").src;

    if (!currentPhotoCard) {
        console.error("편집 중인 프로필 카드가 없습니다.");
        return;
    }

    // 프로필 카드의 기존 데이터를 업데이트
    const titleElement = currentPhotoCard.querySelector("h3");
    const descriptionElement = currentPhotoCard.querySelector("p");
    const tagContainer = currentPhotoCard.querySelector(".tags");
    const imgElement = currentPhotoCard.querySelector("img");

    if (titleElement) titleElement.textContent = title;
    if (descriptionElement) descriptionElement.textContent = description;

    if (tagContainer) {
        tagContainer.innerHTML = ""; // 기존 태그 제거
        tags.forEach(tag => {
            const tagElement = document.createElement("span");
            tagElement.classList.add("tag");
            tagElement.textContent = tag;
            tagContainer.appendChild(tagElement);
        });
    }

    if (imgElement) imgElement.src = imageSrc;

    // 편집 모달 닫기
    closeEditModal();
    savePhotosToLocalStorage(); // 로컬 스토리지 업데이트
}




// 로컬 스토리지에 저장
function savePhotosToLocalStorage() {
    const photos = [];
    const cards = photoGrid.querySelectorAll(".photo-card");
    cards.forEach(card => {
        const img = card.querySelector("img").src;
        const title = card.querySelector("h3").innerText;
        const description = card.querySelector("p").innerText;
        const tags = Array.from(card.querySelectorAll(".tag")).map(tag => tag.innerText);
        const likeCount = card.querySelector(".like-count").innerText;
        photos.push({ img, title, description, tags, likeCount });
    });
    localStorage.setItem("photos", JSON.stringify(photos));
}

// 로컬 스토리지에서 로드
window.onload = function() {
    const storedPhotos = JSON.parse(localStorage.getItem("photos")) || [];
    storedPhotos.forEach(photo => {
        imagePreview = photo.img;
        const photoCard = createPhotoCard(photo.title, photo.description, photo.tags);
        const likeCountElement = photoCard.querySelector(".like-count");
        likeCountElement.innerText = photo.likeCount;
        photoGrid.appendChild(photoCard);
    });
};

// 이벤트 리스너 설정
document.getElementById("fileInput").addEventListener("change", previewImage);
document.getElementById("editSaveButton").addEventListener("click", saveEditedPhotoCard);
document.getElementById("uploadButton").addEventListener("click", () => {
    if (isEditing) {
        saveEditedPhotoCard();
    } else {
        addPhotoCard();
    }
});
