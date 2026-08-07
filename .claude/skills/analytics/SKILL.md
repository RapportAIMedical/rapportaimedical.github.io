---
name: analytics
description: Query Google Analytics data for the Rapport AI Medical production website. Use when the user asks about website traffic, visitors, page views, top pages, traffic sources, countries, bounce rates, engagement, or any website analytics question.
---

# Rapport AI Medical — website analytics

## CRITICAL: production traffic only

The measurement ID `G-BGZV0L8LGV` is hardcoded into every `.html` page in this repo, so the
same GA4 property also receives traffic from **staging, local dev servers, and preview
deployments**. Known non-production hostnames seen in this property:

- `staging-rapportaimedical.netlify.app`
- `localhost`
- `127.0.0.1`
- `rapportaimedicalgithubio.vercel.app`

In the 28 days to 2026-08-06, **only 42% of pageviews (591 of 1394) were real**. Unfiltered,
that period looked like +155% pageview growth; filtered, users were actually **down 14%**.
Reporting unfiltered numbers to leadership means reporting growth that did not happen.

**Therefore: every report MUST filter to `hostName` exactly equal to `rapportaimedical.com`.**
Never report an unfiltered figure. If a query cannot be filtered, say so rather than
presenting the number.

The one legitimate exception: if the user explicitly asks *how much internal traffic there
is*, run an unfiltered `hostName` breakdown — and label it clearly as a data-quality check,
not as traffic.

## Setup (one-time, per developer)

If the `analytics-mcp` MCP server is not connected:

1. Get the service account key file (`key.json`) from a teammate (stored securely, never committed)
2. Save it to `~/.config/ga-mcp/key.json`
3. Create a `.mcp.json` file in the project root (it's already gitignored):
```json
{
  "mcpServers": {
    "analytics-mcp": {
      "command": "pipx",
      "args": ["run", "analytics-mcp"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "<path-to-key.json>",
        "GOOGLE_PROJECT_ID": "invertible-eye-490402-k8"
      }
    }
  }
}
```
4. Restart Claude Code

### If the MCP server hangs

Observed failure: the server accepts a connection but never responds to `initialize`, so no
`mcp__analytics-mcp__*` tools appear. Fall back to the direct API (below) rather than
debugging the transport — same credentials, same property, same numbers.

## Property

- **property_id**: `510026423`
- **Timezone**: Asia/Hong_Kong (HKT, GMT+8)
- **Currency**: HKD

## Path A — MCP (preferred, when connected)

Use `mcp__analytics-mcp__run_report` with property `510026423`, and **always** include the
production hostname filter:

```json
{
  "dimensionFilter": {
    "filter": {
      "fieldName": "hostName",
      "stringFilter": { "value": "rapportaimedical.com" }
    }
  }
}
```

## Path B — direct API fallback

Requires `google-analytics-data` in a venv. The filter is not optional:

```python
import os
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.path.expanduser("~/.config/ga-mcp/key.json")
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange, Dimension, Metric, RunReportRequest, OrderBy, Filter, FilterExpression)

client = BetaAnalyticsDataClient()
PROPERTY = "properties/510026423"
PROD = FilterExpression(filter=Filter(
    field_name="hostName",
    string_filter=Filter.StringFilter(value="rapportaimedical.com")))

resp = client.run_report(RunReportRequest(
    property=PROPERTY,
    date_ranges=[DateRange(start_date="28daysAgo", end_date="yesterday")],
    dimensions=[Dimension(name="pagePath")],
    metrics=[Metric(name="screenPageViews"), Metric(name="activeUsers")],
    dimension_filter=PROD,                      # <-- required
    order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name="screenPageViews"), desc=True)],
    limit=20))
```

Note Python startup on this machine is slow (60s+); run these in the background.

## Common dimensions and metrics

**Dimensions**: pagePath, hostName, country, city, sessionDefaultChannelGrouping,
deviceCategory, date, yearMonth, operatingSystem, browser, landingPage, sessionSourceMedium

**Metrics**: activeUsers, newUsers, sessions, screenPageViews, averageSessionDuration,
bounceRate, engagedSessions, eventCount, userEngagementDuration

Average time on a page is not a native metric — derive it as
`userEngagementDuration / screenPageViews`.

## Output format

- Format results as clean markdown tables
- Include the date range in the output, and state that figures are production-only
- Round durations to whole seconds and percentages to 1 decimal place
- If comparing periods, run two date ranges and show the delta with arrows (e.g. 87 -> 120, +38%)
- If no specific time range is requested, default to the last 28 days

## Reporting caveats

- **Production has lagged `staging` for long stretches** (5+ weeks as of Aug 2026). Before
  attributing a metric change to a site change, check `git log main` — if it hasn't shipped,
  it cannot explain the numbers.
- Sessions with a `(not set)` or empty `landingPage` are tracking noise; call them out rather
  than folding them into totals.
- Figures reported to leadership before Aug 2026 were unfiltered and overstated. Flag this
  when drawing comparisons to older reports.
