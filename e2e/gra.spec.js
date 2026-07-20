// @ts-check
const { test, expect } = require('@playwright/test')
const {
  clearPlayerStorage,
  cleanupE2eFixtures,
  createInstantTask,
  deletePlayer,
  deleteTask,
  findPlayerByName,
  isApiUp,
  registerPlayer
} = require('./gra-helpers')

let apiAvailable = false

test.beforeAll(async ({ request }) => {
  apiAvailable = await isApiUp(request)
  if (apiAvailable) await cleanupE2eFixtures(request)
})

test.afterAll(async ({ request }) => {
  if (apiAvailable) await cleanupE2eFixtures(request)
})

test.describe('Gra festival UI', () => {
  test('host session restored from localStorage after reload', async ({ page }) => {
    test.skip(!apiAvailable, 'Start obozy-festiwal API on :8090')

    const hostPass = process.env.HOST_API_KEY || 'obozy-2026'
    await page.goto('/gra/host')
    await page.evaluate((token) => {
      localStorage.setItem('obozy-gra-host-token', token)
      sessionStorage.clear()
    }, hostPass)

    const tasksOk = page.waitForResponse(
      (res) => res.url().includes('/host/tasks') && res.status() === 200,
      { timeout: 15_000 }
    )
    await page.reload()
    await tasksOk

    await expect(page.getByRole('button', { name: 'Odśwież' })).toBeVisible({ timeout: 5_000 })
    await expect(page.getByLabel('Hasło hosta')).toHaveCount(0)
  })

  test('host login writes token to localStorage', async ({ page }) => {
    test.skip(!apiAvailable, 'Start obozy-festiwal API on :8090')

    await page.goto('/gra/host')
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })

    const hostPass = process.env.HOST_API_KEY || 'obozy-2026'
    await page.getByLabel('Hasło hosta').fill(hostPass)
    await page.getByRole('button', { name: 'Wejdź' }).click()
    await expect(page.getByRole('button', { name: 'Odśwież' })).toBeVisible({ timeout: 15_000 })
    await expect.poll(async () => page.evaluate(() => localStorage.getItem('obozy-gra-host-token'))).toBe(hostPass)
  })

  test('logged-out player sees Accept and identity modal', async ({ page, request }) => {
    test.skip(!apiAvailable, 'Start obozy-festiwal API on :8090')

    const task = await createInstantTask(request, `E2E accept ${Date.now()}`)
    try {
      await page.goto(`/gra/t/${task.acceptToken}`)
      await clearPlayerStorage(page)
      await page.reload()

      const accept = page.getByRole('button', { name: 'Przyjmij zadanie' }).first()
      await expect(accept).toBeVisible({ timeout: 15_000 })
      await expect(page.locator('.gra-quest__side')).toHaveCount(0)

      await accept.click()
      await expect(page.getByRole('dialog')).toBeVisible()
      await expect(page.getByLabel('Twoja ksywa / imię')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Już grałeś wcześniej?' })).toBeVisible()
    } finally {
      await deleteTask(request, task.id)
    }
  })

  test('stale player session shows gate on Twój postęp', async ({ page, request }) => {
    test.skip(!apiAvailable, 'Start obozy-festiwal API on :8090')

    const name = `E2E stale ${Date.now()}`
    const player = await registerPlayer(request, name)
    try {
      await page.goto('/gra/gracz')
      await page.evaluate(({ token, displayName, id }) => {
        localStorage.setItem('obozy-gra-active-token', token)
        localStorage.setItem('obozy-gra-accounts', JSON.stringify([{
          token,
          displayName,
          id,
          lastUsedAt: new Date().toISOString()
        }]))
      }, { token: player.token, displayName: player.displayName, id: player.id })

      await page.reload()
      await expect(page.locator('.gra-fest__name')).toHaveText(player.displayName, { timeout: 15_000 })

      await deletePlayer(request, player.id)
      await page.reload()
      await expect(page.getByRole('heading', { name: 'Kim jesteś?' })).toBeVisible({ timeout: 15_000 })
      await expect(page.locator('.gra-fest__alert')).toHaveCount(0)
    } finally {
      try {
        await deletePlayer(request, player.id)
      } catch {
        // already deleted
      }
    }
  })

  test('modal register completes task accept', async ({ page, request }) => {
    test.skip(!apiAvailable, 'Start obozy-festiwal API on :8090')

    const task = await createInstantTask(request, `E2E full accept ${Date.now()}`)
    const nick = `E2E Full ${Date.now()}`
    try {
      await page.goto(`/gra/t/${task.acceptToken}`)
      await clearPlayerStorage(page)
      await page.reload()

      await page.getByRole('button', { name: 'Przyjmij zadanie' }).first().click()
      const dialog = page.getByRole('dialog')
      await dialog.getByLabel('Twoja ksywa / imię').fill(nick)
      await dialog.getByRole('button', { name: 'Przyjmij zadanie' }).click()

      await expect(page.getByText('Zadanie zaakceptowane')).toBeVisible({ timeout: 15_000 })
      await expect(page.locator('.gra-quest__player')).toContainText(nick)
    } finally {
      await deleteTask(request, task.id)
      const created = await findPlayerByName(request, nick)
      if (created) await deletePlayer(request, created.id)
    }
  })

  test('gra intro and ranking pages load', async ({ page }) => {
    test.skip(!apiAvailable, 'Start obozy-festiwal API on :8090')

    await page.goto('/gra')
    await expect(page.getByRole('navigation', { name: 'Gra' })).toBeVisible()
    await expect(page.getByText('Tajna zabawa festiwalu')).toBeVisible({ timeout: 15_000 })

    await page.goto('/gra/gracze')
    await expect(page.getByRole('heading', { name: 'Ranking' })).toBeVisible({ timeout: 15_000 })
  })

  test('verify view is read-only (no accept CTA)', async ({ page, request }) => {
    test.skip(!apiAvailable, 'Start obozy-festiwal API on :8090')

    const task = await createInstantTask(request, `E2E verify ${Date.now()}`)
    try {
      await page.goto(`/gra/v/${task.verifyToken}`)
      await expect(page.getByText('OBOZY Festiwal · status zadania')).toBeVisible({ timeout: 15_000 })
      await expect(page.getByRole('button', { name: 'Przyjmij zadanie' })).toHaveCount(0)
      await expect(page.getByText('Nie możesz go przyjąć')).toBeVisible()
    } finally {
      await deleteTask(request, task.id)
    }
  })

  test('gra routes respond without crash', async ({ page }) => {
    test.skip(!apiAvailable, 'Start obozy-festiwal API on :8090')

    const routes = ['/gra', '/gra/gracz', '/gra/gracze', '/gra/host']
    for (const path of routes) {
      await page.goto(path)
      await expect(page.getByRole('navigation', { name: 'Gra' })).toBeVisible()
    }
  })
})
