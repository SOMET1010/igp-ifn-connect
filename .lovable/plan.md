

# Debounce visuel sur le bouton Écouter

## Modification

Fichier : `src/shared/ui/OnboardingTutorial.tsx`

Ajouter un état `debounced` avec `useState(false)` et un `useRef` pour le timer. Dans `handlePlayAudio`, activer `debounced = true` pendant 500ms après chaque clic. Le bouton reçoit `disabled={debounced}` pour bloquer les clics rapides.

### Changements concrets

1. Ajouter `const [debounced, setDebounced] = useState(false)` et `const debounceRef = useRef<NodeJS.Timeout>()` (ligne ~62)
2. Dans `handlePlayAudio` : activer le debounce après l'action, clear le timer précédent
3. Cleanup du timer dans un `useEffect` return
4. Ajouter `disabled={debounced}` + style `opacity-50 pointer-events-none` sur le bouton audio

Un seul fichier modifié, ~10 lignes ajoutées.

