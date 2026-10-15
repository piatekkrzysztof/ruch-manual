# Ruch Manual

Demonstracyjna strona gabinetu fizjoterapii manualnej w Krakowie - projekt do portfolio.

**Na żywo:** https://ruch-manual.krzysztof-227.workers.dev/

## Co potrafi

- **Jeden motyw: ćwiartka koła.** „Ruch” z nazwy to zakres ruchu stawu, mierzony w stopniach. Ten sam łuk wycina zdjęcie w hero, maskuje fotografie, tnie przyciski i jest punktorem listy.
- **Gdzie boli** - wybierasz staw, a tarcza-goniometr wypełnia się do orientacyjnej normy zakresu ruchu (np. kolano 135°), rycina anatomiczna przybliża się do tego miejsca, a obok pojawiają się dopasowane terapie z ceną.
- **Karta wizyty** - formularz rezerwacji w formie karty do wycięcia: zabieg, terapeuta, dzień, wolna godzina i dane kontaktowe, z walidacją. Terminy to zawsze najbliższe trzy dni robocze.
- **Pierwsza wizyta** - 50 minut rozpisane na etapy w rozwijanych panelach.
- **Responsywność i dostępność** - osobny układ na telefon, semantyczny HTML, widoczny fokus, link „Przejdź do treści”, obsługa `prefers-reduced-motion`.

Rezerwacja działa tylko po stronie przeglądarki - dane nie są nigdzie wysyłane.

## Stack

- React 19 + Vite
- Ikony: lucide-react
- Font: Hanken Grotesk (Google Fonts)
- Hosting: Cloudflare Workers (statyczne pliki), deploy automatyczny po pushu na `main`

## Uruchomienie lokalne

```bash
npm install
```

```bash
npm run dev
```

Pozostałe skrypty:

- `npm run build` - build produkcyjny do `dist/`
- `npm run lint` - ESLint
- `npm run preview` - build i lokalny podgląd w środowisku Cloudflare
- `npm run deploy` - ręczny deploy przez Wrangler

## Materiały z otwartych zbiorów

Ryciny i wideo pochodzą z otwartych zbiorów i są podpisane w stopce strony. Pełne dane (autor, licencja, źródło) są w `src/assets/found/credits.json` i `public/media/credits.json`.

- Arnauld Éloi Gautier d'Agoty, *Posterior View of Muscle Man* (1773) - domena publiczna (CC0), Art Institute of Chicago
- Igor123121, *Karmelicka street, view to S* (2025) - CC BY 4.0, Wikimedia Commons
- Reiseandenken, *Tram in Krakow* (wideo, przycięty fragment bez dźwięku) - CC BY 3.0, Wikimedia Commons

Zdjęcia w `src/assets/*.jpg` pochodzą z pierwotnej wersji projektu i w demo ilustrują fikcyjny gabinet i terapeutów.
