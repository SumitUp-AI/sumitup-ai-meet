
<img width="259" height="65" alt="Brand Logo White" src="https://github.com/user-attachments/assets/353bf5c5-7b22-43eb-ab09-aa03bfe012d1" />


# Sumitup-AI, The Open Source AI Meeting Assistant:
Sumitup is an open source meeting assistant that records you meetings/sessions on Zoom, Microsoft Teams and Google Meet. Its purpose is to record your meeting by transcribing it and then it gives you a visualized overview of a whole meeting in mindmaps, summary and action items extracted from the meetings. The bot records your meeting in any platform with participants mentioned exactly as in the platform for accurate speaker diarization thus enhancing summary, having enough context for AI to understand. 

## Tech Stack:
- **Backend**: FastAPI (Python), Langchain
- **Vector Storage**: MongoDB Atlas Vector Database
- **Database**: MongoDB
- **User Interface**: React.js, Typescript

## Architecture Diagram:
The whole working process of this app is described in the diagram attached below as:
<img width="992" height="731" alt="ArchitectureSumitup" src="https://github.com/user-attachments/assets/48dd4e56-9fd9-4b02-be50-b03275dc8fcc" />


## Boilerplate (Folder Structure)
**Backend (Server)**:
-  ```core``` represents the business logic of our app.
- ```ai``` represents the code for RAG, Summarization using Langchain
- ```config``` represents all environment variables plus blob storage config and others
- ```auth``` represents JWT Authentication, Refresh and Access Token Configuration
- ```database``` represents database connections, models, and search indexes creation
- ```integrations``` represents other intergrations such as Slack, Email, WhatsApp, Stripe etc
- ```middleware``` tenant aware middleware, rate limiting etc
- ```models``` MongoDB Document Models, Schemas
- ```services``` Meeting Services, other services later etc
- ```router``` API Endpoints Routes
- ```tests``` API Testing and other tests

**Frontend (Client)**:
- ```features``` represents featured pages such as Dashboard, AI Chatbot Interface etc
- ```hooks``` represents custom hooks for context, data etc
- ```context``` represents user auth context, meeting context etc
- ```loaders``` represents dashboard loading screen component
- ```routes``` represents routes for different pages and inner content such as Outlet
- ```types``` represents types for uses in Typescript
- ```utils``` represents utilities such as Date parsers for location and authentication headers for reusability.

```
.
├── client
│   ├── public
│   └── src
│       ├── assets
│       │   ├── about
│       │   └── home
│       ├── components
│       ├── context
│       ├── features
│       │   └── dashboard
│       │       └── teams
│       ├── hooks
│       ├── layouts
│       │   ├── dashboard
│       │   └── site
│       │       ├── authentication
│       │       └── pages
│       ├── loaders
│       ├── routes
│       ├── types
│       └── utils
└── server
    ├── ai
    ├── auth
    ├── config
    ├── core
    │   ├── helpers
    │   └── utils
    ├── database
    ├── integrations
    │   └── email
    ├── middlewares
    ├── models
    ├── router
    │   ├── apis
    │   └── webhooks
    ├── services
    └── tests
  ```

## Releases:
- ```v0.1.0 (Beta)```: Currently in Progress (Backend Testing and Deployment)

## Contribute / Support :
For your contribution, you can contact us [for Support / Contribution](mailto:alhaanahmed68@outlook.com), we will guide you related to your first contribution on Github or Support.
