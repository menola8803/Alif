# Moskékartan (0.5.0)

Ska se ut som kartan i Trace (se karta-som-trace.webp):
- Vanlig ljus OpenStreetMap-karta (osmdroid, MAPNIK) med gator, hus och hållplatser.
- Förklaringsruta uppe till vänster (mörk, rundad): ikon för moské, moské nära dig.
- Runda mörka knappar uppe till höger: kugghjul och "min plats".
- Gul gubbe = din plats (bara om plats är påslaget, av från början).
- Moskéer som små ikoner; tryck för namn, adress och vägbeskrivning.
- Mörk panel nertill: antal moskéer, närmaste moské, två knappar (Lista · Mer).
- © OpenStreetMap-bidragsgivare syns på kartan.

## Källa att jämföra
- https://islam.se/moskeer/ – Claes tips. Jämför med OpenStreetMap när kartan byggs; använd den om den är mer komplett (fråga om lov om appen blir offentlig).
- islam.se listar 234 moskéer i 21 län: namn, adress, kommun, län (inga koordinater i texten; kartan laddas med JavaScript – leta datafilen bakom den). Plan: skript läser listan, slår upp koordinater (Nominatim, 1/s) om de saknas, sparar en fil i appen, slår ihop med OpenStreetMap och tar bort dubbletter. Källan anger att adresser/positioner är ungefärliga.
