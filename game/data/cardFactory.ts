import { Card } from "../entities/Card";
import { CardDefinition } from "./cardDefinitions";

export function createCardFromDefinition(definition: CardDefinition): Card {
  return new Card({
    id: definition.id,
    name: definition.name,
    rarity: definition.rarity,
    cardClass: definition.cardClass,
    basePower: definition.basePower,
    awakening: definition.awakening,
    historia: definition.historia ?? "Desconhecida",
    regiao: definition.regiao ?? "Desconhecida",
  });
}
