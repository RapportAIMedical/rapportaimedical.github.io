---
description: Query Google Analytics data for the Rapport AI Medical website. Use when the user asks about website traffic, visitors, page views, top pages, traffic sources, countries, bounce rates, engagement, or any website analytics question.
---

## Setup (one-time, per developer)

If the `analytics-mcp` MCP server is not connected, tell the user they need to set up:

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

## When the MCP is connected

Use the `mcp__analytics-mcp__run_report` tool with:
- **property_id**: `510026423`
- **Timezone**: Asia/Hong_Kong (HKT, GMT+8)
- **Currency**: HKD

### Common dimensions and metrics

**Dimensions**: pagePath, country, city, sessionDefaultChannelGrouping, deviceCategory, date, yearMonth, operatingSystem, browser, landingPage, sessionSourceMedium
**Metrics**: activeUsers, newUsers, sessions, screenPageViews, averageSessionDuration, bounceRate, engagedSessions, eventCount, userEngagementDuration

### Output format

- Format results as clean markdown tables
- Include the date range in the output
- Round durations to whole seconds and percentages to 1 decimal place
- If comparing periods, run two date ranges and show the delta with arrows (e.g. 87 -> 120, +38%)
- If no specific time range is requested, default to the last 28 days
