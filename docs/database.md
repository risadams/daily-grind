# Daily Grind Data Model Documentation

## Database Schema Documentation

### Core Work Item Models

#### Epic

- **Purpose**: Represents large bodies of work that can be broken down into features
- **Key Fields**:
  - title, description, summary
  - status (ref: Status)
  - priority (ref: Priority)
  - labels (array of refs: Label)
  - storyPoints
  - startDate, targetDate
  - teams (array of refs: Team)
  - owner (ref: User)
  - createdBy (ref: User)
  - attachments (embedded array of files)
- **Virtual Fields**: progress (calculated dynamically)

#### Feature

- **Purpose**: Represents functionality that delivers business value, belongs to an Epic
- **Key Fields**:
  - title, description, summary
  - status (ref: Status)
  - priority (ref: Priority)
  - epic (ref: Epic)
  - labels (array of refs: Label)
  - storyPoints
  - startDate, targetDate
  - teams (array of refs: Team)
  - owner, createdBy (both ref: User)
  - attachments (embedded array of files)
- **Virtual Fields**: progress (calculated dynamically)

#### Task

- **Purpose**: Smallest unit of work, belongs to a Feature
- **Key Fields**:
  - title, description
  - status (ref: Status)
  - priority (ref: Priority)
  - storyPoints
  - sprints (array of refs: Sprint)
  - labels (array of refs: Label)
  - feature (ref: Feature)
  - links (embedded array of TaskLinks)
  - createdBy, assignedTo, reviewedBy (all ref: User)
  - attachments (embedded array of files)
- **Virtual Fields**: splashCount (calculated based on number of sprints)

### Supporting Models

#### Sprint

- **Purpose**: Time-boxed iteration for completing work
- **Key Fields**:
  - name, goal
  - startDate, endDate
  - capacity, velocity
  - status (enum: planning, active, completed, cancelled)
  - retrospective (ref: Retrospective)
  - tasks (array of refs: Task)
  - createdBy (ref: User)

#### Retrospective

- **Purpose**: Post-sprint review document
- **Key Fields**:
  - highlights, improvements, actions (arrays of strings)
  - sprint (ref: Sprint)
  - facilitator (ref: User)
  - participants (array of refs: User)
  - date

#### Team

- **Purpose**: Group of users working together
- **Key Fields**:
  - name, description
  - members (embedded array of TeamMembers)
    - Each TeamMember has: user (ref: User), roles (array of refs: Role)
  - createdBy (ref: User)

#### User

- **Purpose**: System users/team members
- **Key Fields**:
  - email, password (hashed)
  - displayName, photoURL
  - googleId (for OAuth)
  - emailVerified

### Classification/Metadata Models

#### Status

- **Purpose**: Workflow states for work items
- **Key Fields**:
  - name
  - disposition (enum: open, closed)
  - icon, color
  - workflow (array of refs to other Status objects)

#### Priority

- **Purpose**: Importance levels for work items
- **Key Fields**:
  - name, level
  - icon, color

#### Label

- **Purpose**: Tags for categorizing work items
- **Key Fields**:
  - name, color, description
  - createdBy (ref: User)

#### Role

- **Purpose**: User roles within teams
- **Key Fields**:
  - name, description

#### LinkType

- **Purpose**: Defines relationship types between tasks
- **Key Fields**:
  - name, description
  - inverse (relationship name in reverse)
  - icon, color

## Relationship Diagram

```text
┌───────────┐           ┌─────────┐           ┌──────────┐
│   User    │◄──────────┤   Team  ├───────────►   Role   │
└───┬───────┘           └─────────┘           └──────────┘
    │                       ▲
    ▼                       │
┌───────────┐        ┌──────┴────┐           ┌──────────┐
│  Sprint   ├────────►   Epic    ◄───────────┤ Priority │
└─────┬─────┘        └──────┬────┘           └──────────┘
      │                     │                      ▲
      │               ┌─────▼──────┐               │
      │               │  Feature   ├───────────────┘
      │               └─────┬──────┘               ▲
┌─────▼─────┐               │                ┌─────┴────┐
│Retrospect.│         ┌─────▼────┐           │  Label   │
└───────────┘         │   Task   ├───────────►          │
                      └──────────┘           └──────────┘
                           │
                           │                ┌──────────┐
                           └────────────────► LinkType │
                                            └──────────┘
                                                 ▲
                                                 │
                                            ┌────┴─────┐
                                            │  Status  │
                                            └──────────┘
```

## Key Relationships

1. **Work Hierarchy**: Epic → Feature → Task
2. **Assignment**: User can be assigned to Tasks, own Features/Epics, create items
3. **Classification**: Status, Priority, and Labels are applied to work items
4. **Planning**: Tasks are assigned to Sprints
5. **Teams**: Teams have members (Users) with specific Roles
6. **Workflow**: Status objects can define valid workflow transitions
7. **Retrospectives**: Each Sprint can have one Retrospective
8. **Task Linkage**: Tasks can be linked to each other through LinkTypes

## Additional Notes

- All models include timestamps (createdAt, updatedAt)
- Most models use pre-save hooks to automatically update timestamps
- Work items (Epics, Features, Tasks) support file attachments
- Progress tracking is implemented through virtual properties in Epics and Features
- The schema uses MongoDB's referencing capabilities extensively to create relationships
- Team membership includes a roles array for role-based permissions
