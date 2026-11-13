# Issue Tracker: Azure DevOps Boards

Issues and work items for this repository are tracked in Azure DevOps Boards.

- **Organization**: `wimpi`
- **Project**: `Sistema Distrito Scout Cochabamba`
- **MCP Server**: `azure-devops`

## Workflows

### Create Work Items
Use `tools["azure-devops"].wit_work_item_write` with `action: "create"`:
- Project: `Sistema Distrito Scout Cochabamba`
- Work Item Type: `Task`, `Bug`, `User Story`, `Issue`
- Fields: `System.Title`, `System.Description`, `System.AreaPath`, `System.IterationPath`

### Read and Query Work Items
- By ID: `tools["azure-devops"].wit_work_item` with `action: "get"`, `id: <number>`
- WIQL Query: `tools["azure-devops"].wit_query` with `action: "wiql"`, `wiql: "..."`
- Backlog items: `tools["azure-devops"].wit_backlog` with `action: "list_work_items"`

### Update Work Items
- Update fields: `tools["azure-devops"].wit_work_item_write` with `action: "update"`
- Add child work item: `tools["azure-devops"].wit_work_item_write` with `action: "add_child"`
