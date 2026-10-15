# Ruch Manual

Demonstracyjna strona gabinetu fizjoterapii manualnej w Krakowie - projekt do portfolio.

**Na żywo:** https://ruch-manual.krzysztof-227.workers.dev/

## Co potrafi

- **Mapa ciała** - użytkownik zaznacza obszary bólu na figurze (myszą lub klawiaturą), a usługi układają się według dopasowania.
- **Rezerwacja w 4 krokach** - usługa, terapeuta, termin i dane kontaktowe, z walidacją formularza. Terminy to zawsze najbliższe trzy dni robocze.
- **Responsywność** - menu mobilne, rezerwacja jako panel wysuwany od dołu na telefonie.
- **Dostępność** - semantyczny HTML, widoczny fokus, link „Przejdź do treści”, obsługa `prefers-reduced-motion`.

Rezerwacja działa tylko po stronie przeglądarki - dane nie są nigdzie wysyłane.

## Stack

- React 19 + Vite
- Ikony: lucide-react
- Fonty: Fraunces i Geist (Google Fonts)
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
