import { Card } from "../entities/Card";
import { createCardFromDefinition } from "./cardFactory";
import { CARD_DEFINITIONS } from "./cardDefinitions";

export const CARDS: Card[] = CARD_DEFINITIONS.map(createCardFromDefinition);
