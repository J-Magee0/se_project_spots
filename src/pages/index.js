import "./index.css";
import {
  enableValidation,
  settings,
  resetValidation,
} from "../scripts/validation.js";
import { Api } from "../utils/Api.js";
import { data } from "autoprefixer";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "92d1550f-a1e9-4fde-be88-5cb9016dbed7",
    "Content-Type": "application/json",
  },
});

api
  .getAppInfo()
  .then(([cards, userInfo]) => {
    cards.forEach((card) => {
      renderCard(card);
    });
    profileName.textContent = userInfo.name;
    profileDescription.textContent = userInfo.about;
    // profileAvatar.src = userInfo.avatar;
  })
  .catch(console.error);

//Edit profile modal declarations
const editModal = document.querySelector("#edit-modal");
const profileEditButton = document.querySelector(".profile__edit-btn");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");
const profileFormElement = document.forms["profile-form"];

//Avatar modal declarations
const avatarImg = document.querySelector(".profile__avatar");
const avatarModal = document.querySelector("#avatar-modal");
const avatarModalBtn = document.querySelector(".profile__avatar-btn");
const avatarInput = document.querySelector("#profile-avatar-input");
const avatarForm = document.forms["avatar-form"];

const profileNameInput = editModal.querySelector("#profile-name-input");
const profileDescriptionInput = editModal.querySelector(
  "#profile-description-input"
);

//New Card modal declarations
const cardModal = document.querySelector("#add-card-modal");
const newCardButton = document.querySelector(".profile__add-btn");
const cardForm = document.forms["add-card-form"];

//Preview modal declarations
const previewModal = document.querySelector("#preview-modal");
const previewModalImg = previewModal.querySelector(".modal__image");
const previewModalCap = previewModal.querySelector(".modal__caption");

//delete modal declarations
const deleteForm = document.forms["delete-form"];
const deleteModal = document.querySelector("#delete-modal");
const cancelBtn = document.querySelector(".modal__submit-btn_type_cancel");
let selectedCard, selectedCardId;

const popups = document.querySelectorAll(".modal");
const closeButtons = document.querySelectorAll("#modal__close");

closeButtons.forEach((button) => {
  // Find the closest popup only once
  const popup = button.closest(".modal");
  // Set the listener
  button.addEventListener("click", () => closeModal(popup));
});

const cardImgInput = cardModal.querySelector("#card-link-input");
const cardCap = cardModal.querySelector("#card-caption-input");

const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");

function handleEscape(evt) {
  if (evt.key === "Escape") {
    const openedPopup = document.querySelector(".modal_opened");
    if (openedPopup) {
      closeModal(openedPopup);
    }
  }
}

function renderCard(item, method = "prepend") {
  const cardElement = getCardElement(item);
  cardsList[method](cardElement);
}

function handleDeleteCard(cardElement, cardId) {
  selectedCard = cardElement;
  selectedCardId = cardId;
  openModal(deleteModal);
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();
  const deleteSubmitBtn = deleteForm.querySelector("button[type='submit']");
  const originalText = deleteSubmitBtn.textContent;
  deleteSubmitBtn.textContent = "Deleting...";

  api
    .cardDelete(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
    })
    .catch(console.error)
    .finally(() => {
      deleteSubmitBtn.textContent = originalText;
    });
}

function handleCancelBtn() {
  closeModal(deleteModal);
}

function handleLike(evt, id) {
  const isliked = evt.target.classList.contains("card__like-btn_liked");

  api
    .handleLikeStatus(id, isliked)
    .then(() => {
      evt.target.classList.toggle("card__like-btn_liked");
    })
    .catch(console.error);
}

function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);

  const cardNameEL = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardLikeBtn = cardElement.querySelector(".card__like-btn");
  const cardDeleteBtn = cardElement.querySelector(".card__delete-btn");

  cardNameEL.textContent = data.name;
  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;

  cardLikeBtn.addEventListener("click", (evt) => handleLike(evt, data._id));

  cardDeleteBtn.addEventListener("click", () =>
    handleDeleteCard(cardElement, data._id)
  );

  cardImageEl.addEventListener("click", () => {
    openModal(previewModal);
    previewModalImg.src = data.link;
    previewModalImg.alt = data.name;
    previewModalCap.textContent = data.name;
  });

  return cardElement;
}

function openModal(modal) {
  modal.classList.add("modal_opened");
  document.addEventListener("keydown", handleEscape);
}

function closeModal(modal) {
  modal.classList.remove("modal_opened");
  document.removeEventListener("keydown", handleEscape);
}

function handleProfileFormSubmit(evt) {
  evt.preventDefault();
  const profileSubmitBtn = profileFormElement.querySelector(
    "button[type='submit']"
  );
  const originalText = profileSubmitBtn.textContent;
  profileSubmitBtn.textContent = "Saving...";

  api
    .editUserInfo({
      name: profileNameInput.value,
      about: profileDescriptionInput.value,
    })
    .then((data) => {
      profileName.textContent = data.name;
      profileDescription.textContent = data.about;
      closeModal(editModal);
      profileFormElement.reset();
    })
    .catch(console.error)
    .finally(() => {
      profileSubmitBtn.textContent = originalText;
    });
}

function handleNewCardSubmit(evt) {
  evt.preventDefault();
  const inputValues = { name: cardCap.value, link: cardImgInput.value };
  const cardSubmitBtn = cardForm.querySelector("button[type='submit']");
  const originalText = cardSubmitBtn.textContent;
  cardSubmitBtn.textContent = "Saving...";

  api
    .cardAdd({ name: inputValues.name, link: inputValues.link })
    .then((data) => {
      renderCard(data);
      closeModal(cardModal);
      cardForm.reset();
    })
    .catch(console.error)
    .finally(() => {
      cardSubmitBtn.textContent = originalText;
    });
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();
  const avatarSubmitBtn = avatarForm.querySelector("button[type='submit']");
  const originalText = avatarSubmitBtn.textContent;
  avatarSubmitBtn.textContent = "Saving...";

  api
    .editAvatarInfo(avatarInput.value)
    .then((data) => {
      avatarImg.src = data.avatar;
      closeModal(avatarModal);
      avatarForm.reset();
    })
    .catch(console.error)
    .finally(() => {
      avatarSubmitBtn.textContent = originalText;
    });
}

profileEditButton.addEventListener("click", () => {
  profileNameInput.value = profileName.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  resetValidation(
    profileFormElement,
    [profileNameInput, profileDescriptionInput],
    settings
  );
  openModal(editModal);
});

avatarModalBtn.addEventListener("click", () => {
  openModal(avatarModal);
});

avatarForm.addEventListener("submit", handleAvatarSubmit);

profileFormElement.addEventListener("submit", handleProfileFormSubmit);

newCardButton.addEventListener("click", () => {
  openModal(cardModal);
});

cardForm.addEventListener("submit", handleNewCardSubmit);

deleteForm.addEventListener("submit", handleDeleteSubmit);

cancelBtn.addEventListener("click", handleCancelBtn);

popups.forEach((popup) => {
  popup.addEventListener("mousedown", (evt) => {
    if (evt.target.classList.contains("modal_opened")) {
      closeModal(popup);
    }
  });
});

enableValidation(settings);
