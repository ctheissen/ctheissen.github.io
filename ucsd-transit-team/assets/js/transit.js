
// ======================= CONFIG =======================

// Schedule sheet: Date, First Half Observers, Second Half Observers, Target, Telescope, Instrument, Status, Notes
const TRANSIT_SCHEDULE_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1h5aIKTXfG19JB0MhiM-e54l390qoAcCJFw3bmmMrcRU/export?format=csv&gid=0';

// Roster sheet: Name, Role, Checked out?, Responsibilities
const TRANSIT_ROSTER_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1ZKyjHZ-lcoGGsXvEr-z5pCFpbH3xmq_XoR4RObHqKUM/export?format=csv&gid=0';

// Mt Hamilton coordinates for National Weather Service API
const MH_LAT = 37.3419;
const MH_LON = -121.6425;

// ======================= HELPERS =======================

// Robust CSV parser that respects quoted fields and commas inside quotes
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const rows = [];

  for (const line of lines) {
    const cells = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      const next = i + 1 < line.length ? line[i + 1] : null;

      if (ch === '"') {
        if (inQuotes && next === '"') {
          // Escaped quote ("")
          current += '"';
          i++; // skip next
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        cells.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    cells.push(current.trim());
    rows.push(cells);
  }

  return rows;
}

function parseDateLoose(value) {
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function normalizeToMidnight(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function groupBy(arr, keyFn) {
  const out = new Map();
  for (const item of arr) {
    const key = keyFn(item);
    if (!out.has(key)) out.set(key, []);
    out.get(key).push(item);
  }
  return out;
}

// ======================= ROSTER =======================

async function loadTransitRoster() {
  const tbody = document.getElementById('roster-tbody');
  if (!tbody) return;

  try {
    const res = await fetch(TRANSIT_ROSTER_CSV_URL);
    if (!res.ok) throw new Error('Network error fetching roster CSV');

    const text = await res.text();
    const rows = parseCSV(text);

    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="3">Roster sheet appears to be empty.</td></tr>';
      return;
    }

    const headers  = rows[0];
    const dataRows = rows.slice(1);

    const idxName = headers.indexOf('Name');
    const idxRole = headers.indexOf('Role');
    const idxResp = headers.indexOf('Responsibilities');

    if (idxName === -1 || idxRole === -1) {
      tbody.innerHTML =
        '<tr><td colspan="3">Missing required columns. Please include Name and Role.</td></tr>';
      return;
    }

    if (!dataRows.length) {
      tbody.innerHTML = '<tr><td colspan="3">No roster entries found.</td></tr>';
      return;
    }

    const ROLE_ORDER = ['PI', 'COI', 'OBSERVER'];
    function roleRank(roleRaw) {
      if (!roleRaw) return ROLE_ORDER.length;
      const r = String(roleRaw).trim().toUpperCase();
      const idx = ROLE_ORDER.indexOf(r);
      return idx === -1 ? ROLE_ORDER.length : idx;
    }

    dataRows.sort((a, b) => {
      const roleA = a[idxRole] || '';
      const roleB = b[idxRole] || '';
      const rankA = roleRank(roleA);
      const rankB = roleRank(roleB);
      if (rankA !== rankB) return rankA - rankB;
      return (a[idxName] || '').toLowerCase().localeCompare((b[idxName] || '').toLowerCase());
    });

    tbody.innerHTML = '';
    dataRows.forEach(row => {
      const tr = document.createElement('tr');
      const tdName = document.createElement('td');
      const tdRole = document.createElement('td');
      const tdResp = document.createElement('td');

      tdName.textContent = row[idxName] || '';
      tdRole.textContent = row[idxRole] || '';
      tdResp.textContent = idxResp >= 0 ? (row[idxResp] || '') : '';

      tr.appendChild(tdName);
      tr.appendChild(tdRole);
      tr.appendChild(tdResp);
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
    tbody.innerHTML =
      '<tr><td colspan="3">Error loading roster. Check CSV publish settings.</td></tr>';
  }
}

// ======================= NWS FORECAST (SHARED) =======================

let NWS_FORECAST_PERIODS = null;
let NWS_FORECAST_PROMISE = null;

async function fetchNwsForecast() {
  if (NWS_FORECAST_PERIODS) return NWS_FORECAST_PERIODS;
  if (!NWS_FORECAST_PROMISE) {
    NWS_FORECAST_PROMISE = (async () => {
      const pointUrl = `https://api.weather.gov/points/${MH_LAT},${MH_LON}`;
      const res1 = await fetch(pointUrl, { headers: { 'Accept': 'application/geo+json' } });
      if (!res1.ok) throw new Error('Error fetching NWS points data');
      const meta = await res1.json();
      const forecastUrl = meta.properties && meta.properties.forecast;
      if (!forecastUrl) throw new Error('No forecast URL found in NWS response');

      const res2 = await fetch(forecastUrl, { headers: { 'Accept': 'application/geo+json' } });
      if (!res2.ok) throw new Error('Error fetching NWS forecast data');
      const forecast = await res2.json();

      const periods = forecast.properties && forecast.properties.periods;
      if (!Array.isArray(periods) || !periods.length) {
        throw new Error('No forecast periods returned');
      }
      return periods;
    })().catch(err => {
      NWS_FORECAST_PROMISE = null;
      throw err;
    });
  }
  NWS_FORECAST_PERIODS = await NWS_FORECAST_PROMISE;
  return NWS_FORECAST_PERIODS;
}

function buildForecastByDayMap(periods) {
  const map = new Map();
  periods.forEach(p => {
    if (!p.startTime) return;
    const start = new Date(p.startTime);
    if (isNaN(start.getTime())) return;
    const dayIso = normalizeToMidnight(start).toISOString();
    if (!map.has(dayIso)) map.set(dayIso, []);
    map.get(dayIso).push(p);
  });
  return map;
}

function classifyWeatherQuality(shortForecast) {
  if (!shortForecast) return null;
  const s = shortForecast.toLowerCase();
  if (s.includes('thunder') || s.includes('snow') || s.includes('sleet') || s.includes('hail')) {
    return 'bad';
  }
  if (s.includes('rain') || s.includes('showers') || s.includes('storm')) {
    return 'bad';
  }
  if (s.includes('clear') || s.includes('sunny')) {
    return 'good';
  }
  if (s.includes('partly') || s.includes('mostly cloudy') || s.includes('fog') || s.includes('drizzle')) {
    return 'ok';
  }
  return 'ok';
}

function classifyConfidence(obsDateMid) {
  if (!obsDateMid) return null;
  const today = normalizeToMidnight(new Date());
  const diffMs = obsDateMid.getTime() - today.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays <= 1) return 'high';
  if (diffDays <= 3) return 'medium';
  return 'low';
}

function summarizeForecastForDay(periodsForDay, obsDateMid) {
  if (!periodsForDay || !periodsForDay.length) {
    return null;
  }
  let chosen = periodsForDay.find(p => p.isDaytime === false) || periodsForDay[0];
  const tempPart = (chosen.temperature != null)
    ? `${chosen.temperature} °${chosen.temperatureUnit || 'F'}`
    : '';
  const short = chosen.shortForecast || '';
  let text;
  if (tempPart && short) text = `${short} (${tempPart})`;
  else text = short || tempPart;

  const quality = classifyWeatherQuality(short);
  const confidence = classifyConfidence(obsDateMid);

  return {
    text,
    icon: chosen.icon || null,
    quality,
    confidence
  };
}

// ======================= CURRENT CONDITIONS (NOW + TONIGHT) =======================

async function loadCurrentConditions() {
  const nowEl = document.getElementById('mh-current-now');
  const tonightEl = document.getElementById('mh-current-tonight');

  if (!nowEl && !tonightEl) return;

  function setIfPresent(el, text) {
    if (el) el.textContent = text;
  }

  // --- CURRENT CONDITIONS ("NOW") ---
  if (nowEl) {
    setIfPresent(nowEl, 'Loading current conditions…');
    try {
      const pointUrl = `https://api.weather.gov/points/${MH_LAT},${MH_LON}`;
      const res1 = await fetch(pointUrl, { headers: { 'Accept': 'application/geo+json' } });
      if (!res1.ok) throw new Error('Error fetching NWS point metadata');
      const meta = await res1.json();

      const stationsUrl = meta.properties && meta.properties.observationStations;
      if (!stationsUrl) throw new Error('No observationStations URL in NWS metadata');

      const res2 = await fetch(stationsUrl, { headers: { 'Accept': 'application/geo+json' } });
      if (!res2.ok) throw new Error('Error fetching NWS observation stations');
      const stations = await res2.json();

      const firstStation = stations.features && stations.features[0];
      if (!firstStation || !firstStation.id) throw new Error('No observation station found');

      const obsUrl = `${firstStation.id}/observations/latest`;
      const res3 = await fetch(obsUrl, { headers: { 'Accept': 'application/geo+json' } });
      if (!res3.ok) throw new Error('Error fetching latest observation');
      const latest = await res3.json();
      const props = latest.properties || {};

      let desc = props.textDescription || 'No recent observation';
      let tempStr = '';
      if (props.temperature && typeof props.temperature.value === 'number') {
        const c = props.temperature.value;
        const f = c * 9/5 + 32;
        tempStr = ` (${f.toFixed(0)} °F)`;
      }
      setIfPresent(nowEl, desc + tempStr);
    } catch (err) {
      console.warn('Error loading current conditions:', err);
      setIfPresent(nowEl, 'Error loading current conditions.');
    }
  }

  // --- TONIGHT FORECAST ---
  if (tonightEl) {
    setIfPresent(tonightEl, 'Loading tonight’s forecast…');
    try {
      const periods = await fetchNwsForecast();
      const todayMid = normalizeToMidnight(new Date());
      const byDay = buildForecastByDayMap(periods);
      const todaysPeriods = byDay.get(todayMid.toISOString());

      let summary = null;

      if (Array.isArray(periods)) {
        const tonightNamed = periods.find(p => p.name && /tonight/i.test(p.name));
        if (tonightNamed) {
          const tempPart = (tonightNamed.temperature != null)
            ? `${tonightNamed.temperature} °${tonightNamed.temperatureUnit || 'F'}`
            : '';
          const short = tonightNamed.shortForecast || '';
          let text;
          if (tempPart && short) text = `${short} (${tempPart})`;
          else text = short || tempPart;
          summary = {
            text,
            icon: tonightNamed.icon || null,
            quality: classifyWeatherQuality(short),
            confidence: classifyConfidence(todayMid)
          };
        }
      }

      if (!summary) {
        summary = summarizeForecastForDay(todaysPeriods || [], todayMid);
      }

      if (summary) {
        const parts = [];
        if (summary.icon) {
          parts.push(`<img src="${summary.icon}" alt="${summary.text || 'Weather icon'}" class="weather-icon-small" />`);
        }
        if (summary.text) {
          parts.push(`<span>${summary.text}</span>`);
        }
        setIfPresent(tonightEl, '');
        tonightEl.innerHTML = parts.join(' ');
      } else {
        setIfPresent(tonightEl, 'No forecast data available for tonight.');
      }
    } catch (err) {
      console.warn('Error loading tonight forecast:', err);
      setIfPresent(tonightEl, 'Error loading tonight’s forecast.');
    }
  }
}

// ======================= SCHEDULE =======================

async function loadTransitSchedule() {
  const statusEl = document.getElementById('schedule-status');
  const theadEl  = document.getElementById('schedule-thead');
  const tbodyEl  = document.getElementById('schedule-tbody');
  const calendarEl = document.getElementById('schedule-calendar-view');
  const observerFilter = document.getElementById('observer-filter');
  const telescopeFilter = document.getElementById('telescope-filter');

  if (!statusEl) return;

  let forecastByDay = null;
  let forecastError = null;
  try {
    const periods = await fetchNwsForecast();
    forecastByDay = buildForecastByDayMap(periods);
  } catch (e) {
    console.warn('Could not fetch NWS forecast for schedule integration:', e);
    forecastError = e;
  }

  try {
    statusEl.textContent = 'Loading schedule from Google Sheets…';
    const res = await fetch(TRANSIT_SCHEDULE_CSV_URL);
    if (!res.ok) throw new Error('Network error fetching schedule CSV');
    const text = await res.text();
    const rows = parseCSV(text);

    if (!rows.length) {
      statusEl.textContent = 'Schedule sheet appears to be empty.';
      return;
    }

    const headers = rows[0];
    const dataRows = rows.slice(1);

    const idxDate      = headers.indexOf('Date');
    const idxObs1      = headers.indexOf('First Half Observers');
    const idxObs2      = headers.indexOf('Second Half Observers');
    const idxTarget    = headers.indexOf('Target');
    const idxTelescope = headers.indexOf('Telescope');
    const idxInstrument= headers.indexOf('Instrument');
    const idxStatus    = headers.indexOf('Status');

    if (idxDate === -1 || idxObs1 === -1 || idxObs2 === -1) {
      statusEl.innerHTML = 'Missing required columns. Please include ' +
        '<code>Date</code>, <code>First Half Observers</code>, and <code>Second Half Observers</code> in the header row.';
      return;
    }

    // Header for list view: Date, Telescope, Observers, Forecast / Status
    if (theadEl) {
      theadEl.innerHTML = '';
      const headerRow = document.createElement('tr');
      ['Date', 'Telescope', 'Observers', 'Forecast / Status'].forEach(label => {
        const th = document.createElement('th');
        th.textContent = label;
        headerRow.appendChild(th);
      });
      theadEl.appendChild(headerRow);
    }

    const processed = dataRows.map(cells => {
      const dateStr = cells[idxDate] || '';
      const parsedDate = parseDateLoose(dateStr);
      const obsMid = parsedDate ? normalizeToMidnight(parsedDate) : null;

      // Combine observers from both halves, dedupe and sort
      let obsList = [];
      if (idxObs1 >= 0 && cells[idxObs1]) {
        obsList = obsList.concat(
          cells[idxObs1].split(/[;,]/).map(o => o.trim()).filter(Boolean)
        );
      }
      if (idxObs2 >= 0 && cells[idxObs2]) {
        obsList = obsList.concat(
          cells[idxObs2].split(/[;,]/).map(o => o.trim()).filter(Boolean)
        );
      }
      obsList = [...new Set(obsList)].sort((a, b) => a.localeCompare(b));
      const observerString = obsList.join('; ');

      const statusText = idxStatus >= 0 ? (cells[idxStatus] || '') : '';

      let forecast = null;
      if (obsMid && forecastByDay) {
        const dayIso = obsMid.toISOString();
        const periodsForDay = forecastByDay.get(dayIso);
        forecast = summarizeForecastForDay(periodsForDay, obsMid);
      }

      return {
        raw: cells,
        parsedDate,
        dateDisplay: dateStr,
        observers: obsList,
        observerString,
        telescope: idxTelescope >= 0 ? (cells[idxTelescope] || '') : '',
        target: idxTarget >= 0 ? (cells[idxTarget] || '') : '',
        instrument: idxInstrument >= 0 ? (cells[idxInstrument] || '') : '',
        status: statusText,
        forecast
      };
    });

    // Observer filter
    if (observerFilter) {
      const observerSet = new Set();
      processed.forEach(r => {
        r.observers.forEach(name => observerSet.add(name));
      });
      const observers = [...observerSet].sort();
      observers.forEach(obs => {
        const opt = document.createElement('option');
        opt.value = obs;
        opt.textContent = obs;
        observerFilter.appendChild(opt);
      });
    }

    // Telescope filter
    if (telescopeFilter) {
      const telescopes = Array.from(new Set(
        processed.map(r => r.telescope.trim()).filter(Boolean)
      )).sort();
      telescopes.forEach(tel => {
        const opt = document.createElement('option');
        opt.value = tel;
        opt.textContent = tel;
        telescopeFilter.appendChild(opt);
      });
    }

    function filteredRowsBase() {
      const selectedObserver = observerFilter ? observerFilter.value : '';
      const selectedTelescope = telescopeFilter ? telescopeFilter.value : '';

      return processed.filter(row => {
        if (selectedObserver && !row.observers.includes(selectedObserver)) return false;
        if (selectedTelescope && row.telescope !== selectedTelescope) return false;
        return true;
      });
    }

    function forecastFallbackText(row) {
      const todayMid = normalizeToMidnight(new Date());

      if (!row.parsedDate) {
        return row.status && row.status.trim()
          ? row.status
          : 'No forecast (invalid date)';
      }

      const diffDays = (normalizeToMidnight(row.parsedDate) - todayMid) / (1000 * 60 * 60 * 24);

      if (diffDays < -1) {
        if (row.status && row.status.trim()) return row.status;
        return 'Past date (no forecast)';
      }

      if (forecastError) return 'NWS forecast unavailable';
      if (diffDays > 10) return 'Beyond NWS forecast range';
      return 'No forecast';
    }

    function renderListView() {
      if (!tbodyEl) return;
      const base = filteredRowsBase().filter(r => r.parsedDate);

      if (!base.length) {
        tbodyEl.innerHTML = '';
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 4;
        td.textContent = 'No rows match the current filters.';
        tr.appendChild(td);
        tbodyEl.appendChild(tr);
        return;
      }

      const todayMid = normalizeToMidnight(new Date());
      const nearest = [...base].sort((a, b) => {
        const da = normalizeToMidnight(a.parsedDate) - todayMid;
        const db = normalizeToMidnight(b.parsedDate) - todayMid;
        return Math.abs(da) - Math.abs(db);
      }).slice(0, 3);

      nearest.sort((a, b) => a.parsedDate - b.parsedDate);

      tbodyEl.innerHTML = '';
      nearest.forEach(row => {
        const tr = document.createElement('tr');
        const rowMid = row.parsedDate ? normalizeToMidnight(row.parsedDate) : null;
        const isPast = rowMid && rowMid < todayMid;

        const tdDate = document.createElement('td');
        tdDate.textContent = row.dateDisplay || (row.parsedDate ? row.parsedDate.toLocaleDateString() : '');
        tr.appendChild(tdDate);

        const tdTel = document.createElement('td');
        tdTel.textContent = row.telescope || '';
        tr.appendChild(tdTel);

        const tdObs = document.createElement('td');
        tdObs.textContent = row.observerString || '';
        tr.appendChild(tdObs);

        const tdForecast = document.createElement('td');

        if (isPast && row.status && row.status.trim()) {
          tdForecast.textContent = row.status;
        } else {
          const f = row.forecast;
          if (f) {
            const qClass = f.quality ? `weather-quality-${f.quality}` : '';
            const conf = f.confidence;
            const confLabel = conf ? conf.charAt(0).toUpperCase() + conf.slice(1) + ' confidence' : '';
            if (qClass) tdForecast.classList.add(qClass);
            tdForecast.innerHTML = `
              <div class="weather-cell">
                <div class="weather-cell-main">
                  ${f.icon ? `<img src="${f.icon}" alt="${f.text || 'Weather icon'}" class="weather-icon-small" />` : ''}
                  <span>${f.text || ''}</span>
                </div>
                ${conf ? `<div class="weather-confidence conf-${conf}">${confLabel}</div>` : ''}
              </div>
            `;
          } else {
            tdForecast.textContent = forecastFallbackText(row);
          }
        }

        tr.appendChild(tdForecast);
        tbodyEl.appendChild(tr);
      });
    }

    function renderCalendarView() {
      if (!calendarEl) return;
      const rowsToShow = filteredRowsBase().filter(r => r.parsedDate);
      rowsToShow.sort((a, b) => a.parsedDate - b.parsedDate);

      calendarEl.innerHTML = '';
      if (!rowsToShow.length) {
        const p = document.createElement('p');
        p.textContent = 'No rows match the current filters.';
        calendarEl.appendChild(p);
        return;
      }

      const grouped = groupBy(rowsToShow, r => normalizeToMidnight(r.parsedDate).toISOString());
      const todayMid = normalizeToMidnight(new Date());

      for (const [iso, groupRows] of grouped.entries()) {
        const dateObj = new Date(iso);
        const dateDiv = document.createElement('div');
        dateDiv.className = 'calendar-day';

        const heading = document.createElement('h3');
        heading.textContent = dateObj.toLocaleDateString(undefined, {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
        dateDiv.appendChild(heading);

        groupRows.forEach(r => {
          const card = document.createElement('div');
          card.className = 'calendar-entry';

          const target = r.target || 'Target TBD';
          const observer = r.observerString || 'Observer TBD';
          const telescope = r.telescope || '';
          const instrument = r.instrument || '';

          const rowMid = r.parsedDate ? normalizeToMidnight(r.parsedDate) : null;
          const isPast = rowMid && rowMid < todayMid;

          let weatherHtml = '';
          if (isPast && r.status && r.status.trim()) {
            weatherHtml = `
              <div class="ce-weather">
                <span class="ce-weather-text">${r.status}</span>
              </div>
            `;
          } else {
            const f = r.forecast;
            if (f) {
              const qClass = f.quality ? `weather-quality-${f.quality}` : '';
              const conf = f.confidence;
              const confLabel = conf ? conf.charAt(0).toUpperCase() + conf.slice(1) + ' confidence' : '';
              weatherHtml = `
                <div class="ce-weather ${qClass}">
                  ${f.icon ? `<img src="${f.icon}" alt="${f.text || 'Weather icon'}" class="weather-icon-small" />` : ''}
                  <span class="ce-weather-text">${f.text || ''}</span>
                  ${conf ? `<span class="weather-confidence conf-${conf}">${confLabel}</span>` : ''}
                </div>
              `;
            } else {
              weatherHtml = `
                <div class="ce-weather">
                  <span class="ce-weather-text">${forecastFallbackText(r)}</span>
                </div>
              `;
            }
          }

          card.innerHTML = `
            <div class="ce-main">
              <div class="ce-target">${target}</div>
              <div class="ce-observer">${observer}</div>
            </div>
            <div class="ce-meta">
              ${telescope ? `<span>${telescope}</span>` : ''}
              ${instrument ? `<span>${instrument}</span>` : ''}
            </div>
            ${weatherHtml}
          `;
          dateDiv.appendChild(card);
        });

        calendarEl.appendChild(dateDiv);
      }
    }

    function renderAll() {
      renderListView();
      renderCalendarView();
      if (forecastError) {
        statusEl.textContent = 'Schedule loaded. NWS forecast could not be fetched; future nights show fallback text, past nights show Status when available.';
      } else {
        statusEl.textContent = '';
      }
    }

    if (observerFilter) observerFilter.addEventListener('change', renderAll);
    if (telescopeFilter) telescopeFilter.addEventListener('change', renderAll);

    renderAll();

    const btnList = document.getElementById('view-list');
    const btnCal  = document.getElementById('view-calendar');
    const listView = document.getElementById('schedule-list-view');

    function setView(mode) {
      if (!listView || !calendarEl || !btnList || !btnCal) return;
      if (mode === 'list') {
        listView.style.display = '';
        calendarEl.style.display = 'none';
        btnList.classList.add('active');
        btnCal.classList.remove('active');
      } else {
        listView.style.display = 'none';
        calendarEl.style.display = '';
        btnList.classList.remove('active');
        btnCal.classList.add('active');
      }
    }

    if (btnList) btnList.addEventListener('click', () => setView('list'));
    if (btnCal) btnCal.addEventListener('click', () => setView('calendar'));
  } catch (err) {
    console.error(err);
    if (statusEl) {
      statusEl.innerHTML = 'Error loading schedule. Double-check that your ' +
        'Google Sheet is published as CSV and the URL is correct.';
    }
  }
}

// ======================= INIT =======================

document.addEventListener('DOMContentLoaded', function () {
  // Mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const siteHeader = document.querySelector('.site-header');
  if (navToggle && siteHeader) {
    navToggle.addEventListener('click', () => {
      const isOpen = siteHeader.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  loadTransitRoster();
  loadTransitSchedule();
  loadCurrentConditions();
});
