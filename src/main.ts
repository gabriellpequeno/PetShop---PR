import { app } from './app'
import { PORT } from './constants/port'

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
