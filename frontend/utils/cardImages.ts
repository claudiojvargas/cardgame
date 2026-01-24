const CARD_IMAGE_BASE_PATH = "/cards";

export function getCardImageUrl(cardId: string, extension = "png") {
  return `${CARD_IMAGE_BASE_PATH}/${cardId}.${extension}`;
}
