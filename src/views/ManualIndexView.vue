<script>
import { manuals } from '@/data/manual-ir/registry'
import { updateMetaTags } from '@/lib/metaUtils.js'

export default {
  name: 'ManualIndexView',
  data() {
    return {
      q: ''
    }
  },
  computed: {
    items() {
      const list = Object.values(manuals || {})
        .map((m) => ({
          id: m.id,
          title: m.meta?.title || m.id,
          description: m.meta?.description || '',
          logoUrl: m.meta?.logoUrl || null,
          parts: (m.parts || []).length,
          tiles: (m.parts || []).reduce((acc, p) => acc + ((p.tiles || []).length), 0)
        }))
        .sort((a, b) => a.title.localeCompare(b.title))

      const q = this.q.trim().toLowerCase()
      if (!q) return list
      return list.filter((x) => {
        return (
          x.title.toLowerCase().includes(q) ||
          x.description.toLowerCase().includes(q) ||
          x.id.toLowerCase().includes(q)
        )
      })
    }
  },
  mounted() {
    const t = 'Instrukcje | Obozy - Gra Terenowa'
    document.title = t
    updateMetaTags({
      title: t,
      description: 'Lista interaktywnych instrukcji do gier Obozy.',
      image: 'https://obozy.org.pl/og-image.png',
      imageAlt: t,
      url: window.location.href
    })
  }
}
</script>

<template>
  <div class="manual-index">
    <div class="manual-index__hero">
      <div class="container" style="max-width: 820px">

        <div class="card manual-index__search">
          <div class="card-content">
            <div class="input-field" style="margin: 0">
              <i class="material-icons prefix" style="color: #9e9e9e">search</i>
              <input v-model="q" id="manual-index-q" type="search" placeholder="Szukaj instrukcji…" />
            </div>
          </div>
        </div>

        <div class="manual-index__list">
          <router-link v-for="m in items" :key="m.id" class="card manual-card" :to="`/instrukcja/${m.id}`">
            <div class="card-content">
              <div class="manual-card__row">
                <div class="manual-card__left">
                  <img v-if="m.logoUrl" :src="m.logoUrl" class="manual-card__logo" width="40" height="40" alt="" />
                  <div>
                    <div class="manual-card__title">{{ m.title }}</div>
                    <div v-if="m.description" class="manual-card__desc">{{ m.description }}</div>
                    <div class="text-darken-1 manual-card__meta grey-text">
                      <span>{{ m.parts }} części</span>
                      <span class="manual-card__dot">·</span>
                      <span>{{ m.tiles }} ekranów</span>
                    </div>
                  </div>
                </div>
                <div class="manual-card__right">
                  <i class="text-darken-2 material-icons green-text">chevron_right</i>
                </div>
              </div>
            </div>
          </router-link>

          <div v-if="!items.length" class="manual-index__empty card">
            <div class="card-content">
              <p style="margin: 0">Brak wyników.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.manual-index {
  background: #eceff1;
  min-height: 100dvh;
}

.manual-index__hero {
  padding: 1rem 0 2rem;
}

.manual-index__search {
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.manual-index__list {
  margin-top: 0.75rem;
  display: grid;
  gap: 0.75rem;
}

.manual-card {
  display: block;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #4caf50;
  color: inherit;
}

.manual-card:hover {
  transform: translateY(-1px);
}

.manual-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.manual-card__left {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  min-width: 0;
}

.manual-card__logo {
  border-radius: 8px;
  flex: 0 0 auto;
}

.manual-card__title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #263238;
  line-height: 1.2;
}

.manual-card__desc {
  margin-top: 0.25rem;
  color: #455a64;
  line-height: 1.3;
  font-size: 0.95rem;
}

.manual-card__meta {
  margin-top: 0.35rem;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.manual-card__dot {
  opacity: 0.7;
}

.manual-card__right {
  flex: 0 0 auto;
}

.manual-index__empty {
  border-radius: 10px;
}
</style>
