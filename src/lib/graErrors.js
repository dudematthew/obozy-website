/**
 * API returns English messages; map known ones for the Polish UI.
 * Unknown strings pass through unchanged.
 */
const MESSAGE_PL = {
  'No player found with that display name': 'Nie znaleziono gracza o tym imieniu.',
  'Player not found': 'Nie znaleziono gracza.',
  'Display name already taken': 'To imię jest już zajęte.',
  'displayName or playerId is required': 'Podaj imię albo ID gracza.',
  'displayName must be between 1 and 64 characters': 'Imię musi mieć od 1 do 64 znaków.',
  'playerId must be a positive integer': 'ID gracza musi być dodatnią liczbą całkowitą.',
  'q must be at most 64 characters': 'Wyszukiwanie może mieć najwyżej 64 znaki.',
  'Missing player token': 'Brak tokenu gracza. Zaloguj się ponownie.',
  'Invalid player token': 'Nieprawidłowy token gracza. Zaloguj się ponownie.',
  'Invalid host credentials': 'Błędne hasło hosta.',
  'Invalid master key': 'Błędny klucz master.',
  'Master key is not configured': 'Klucz master nie jest skonfigurowany na serwerze.',
  'Task not found': 'Nie znaleziono zadania.',
  'Assignment not found': 'Nie znaleziono przyjęcia.',
  'Task is already completed': 'Zadanie jest już ukończone.',
  'Task is outside its accept time window': 'Zadanie jest poza oknem przyjęć.',
  'You already accepted this task': 'Już przyjąłeś to zadanie.',
  'Task is not available for acceptance': 'Zadanie nie jest dostępne do przyjęcia.',
  'Player token required': 'Wymagany token gracza.',
  'Only accepted assignments can be failed': 'Można odrzucić tylko przyjęte zadanie.',
  'Only completed assignments can be revoked': 'Można cofnąć tylko ukończone zadanie.',
  'Assignment is already resolved': 'To przyjęcie jest już rozstrzygnięte.',
  'Failed assignments cannot be completed': 'Nieudanych przyjęć nie można ukończyć.',
  'Assignment is not in accepted state': 'Przyjęcie nie jest w stanie „przyjęte”.',
  'Completed tasks cannot be released': 'Ukończonych zadań nie można odblokować.',
  'This task does not use stake scoring': 'To zadanie nie używa stawek.',
  'Stake must be set before resolve': 'Najpierw ustaw stawkę.',
  'stake is required': 'Podaj stawkę.',
  'won is required': 'Podaj wynik stawki.',
  'winnerPlayerId is required': 'Wybierz zwycięzcę.',
  'winnerPlayerId or winnerTeam is required': 'Wybierz zwycięzcę lub drużynę.',
  'No accepted assignment on winning team': 'Brak przyjętych graczy w tej drużynie.',
  'Task is not a versus task': 'To nie jest zadanie versus.',
  'Winner must have an accepted assignment on this task':
    'Zwycięzca musi mieć aktywne przyjęcie tego zadania.',
  'Timer already started': 'Zegar już wystartował.',
  'This task has no soft timer': 'To zadanie nie ma miękkiego zegara.',
  'timerStart must be accept or manual': 'timerStart musi być accept albo manual.',
  'maxAssignees must be at least 1': 'Liczba miejsc musi być co najmniej 1.',
  'Request body must be valid JSON object': 'Niepoprawne ciało żądania JSON.'
}

export function polishApiMessage (message) {
  if (message == null || message === '') return message
  const key = String(message)
  if (MESSAGE_PL[key]) return MESSAGE_PL[key]

  const stakeRange = /^stake must be between (\d+) and (\d+)$/.exec(key)
  if (stakeRange) {
    return `Stawka musi być między ${stakeRange[1]} a ${stakeRange[2]}.`
  }

  const unknownLogic = /^Unknown task logic type: (.+)$/.exec(key)
  if (unknownLogic) {
    return `Nieznany typ logiki zadania: ${unknownLogic[1]}.`
  }

  const badDatetime = /^(.+) must be a valid datetime$/.exec(key)
  if (badDatetime) {
    return `${badDatetime[1]} musi być poprawną datą.`
  }

  return key
}
