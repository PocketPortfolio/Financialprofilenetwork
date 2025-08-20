#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/setup-pocket-portfolio.sh <owner> <repo> [project_number]
OWNER="${1:-}"
REPO="${2:-}"
PNUM="${3:-1}"

if ! command -v gh >/dev/null 2>&1; then
  echo "Please install GitHub CLI (gh) and authenticate: https://cli.github.com/"
  exit 1
fi

echo "Creating labels..."
gh label create "type/feature" -d "Feature request" || true
gh label create "type/bug" -d "Bug" || true
gh label create "type/design" -d "Design task" || true
gh label create "type/docs" -d "Docs" || true
gh label create "status/needs-triage" -d "Awaiting triage" || true
gh label create "status/needs-spec" -d "Spec required" || true
gh label create "status/needs-design" -d "Needs design" || true
gh label create "status/voting" -d "In community vote" || true
gh label create "status/ready" -d "Ready for dev" || true
gh label create "status/in-progress" -d "In development" || true
gh label create "status/review" -d "In review" || true
gh label create "status/blocked" -d "Blocked" || true
gh label create "good first issue" -d "New-contributor friendly" || true
gh label create "help wanted" -d "Looking for help" || true
gh label create "priority/p0" -d "Critical" || true
gh label create "priority/p1" -d "High" || true
gh label create "priority/p2" -d "Medium" || true
gh label create "priority/p3" -d "Low" || true
gh label create "area/tracking" || true
gh label create "area/prices" || true
gh label create "area/news" || true
gh label create "area/perf" || true
gh label create "area/i18n" || true
gh label create "area/mock-trading" || true
gh label create "area/auth" || true

echo "Creating Project (v2) if needed..."
# Try to fetch; if not exists, create with GraphQL
PID=$(gh api graphql -f query='
query($owner:String!, $repo:String!, $number:Int!){
  repository(owner:$owner, name:$repo){ projectsV2(number:$number){ id } }
}' -f owner="$OWNER" -f repo="$REPO" -F number="$PNUM" --jq '.data.repository.projectsV2.id' || true)

if [ -z "$PID" ] || [ "$PID" = "null" ]; then
  echo "Creating new project..."
  PID=$(gh api graphql -f query='
mutation($owner:String!, $repo:String!){
  createProjectV2(input:{ownerId: repository(owner:$owner, name:$repo){owner{id}} ownerType:REPOSITORY title:"Pocket Portfolio – Public Roadmap"}){
    projectV2{ id }
  }
}' -f owner="$OWNER" -f repo="$REPO" --jq '.data.createProjectV2.projectV2.id')
fi

echo "Project id: $PID"

echo "Adding number fields (Reach, Impact, Confidence, Effort, RICE)..."
for FIELD in Reach Impact Confidence Effort RICE; do
  gh api graphql -f query='
  mutation($projectId:ID!, $name:String!){
    addProjectV2Field(input:{projectId:$projectId, dataType:NUMBER, name:$name}){
      projectV2Field{ id }
    }
  }' -F projectId="$PID" -F name="$FIELD" >/dev/null || true
done

echo "NOTE: Enabling Discussions & creating categories must be done in the repo Settings UI (not fully supported via API). Create categories: Ideas & Feedback, Specs, Designs, Design Votes."

echo "Done. Set repository variable PROJECT_NUMBER to your project index (default 1) for the workflow to update RICE automatically."
