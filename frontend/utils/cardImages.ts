const CARD_IMAGE_BASE_PATH = `${import.meta.env.BASE_URL}cards`;

export function getCardImageUrl(cardId: string, extension = "png") {
  return `${CARD_IMAGE_BASE_PATH}/${cardId}.${extension}`;
}
