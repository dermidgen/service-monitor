# Basic service monitoring
Built on cloud9ide and designed to be run from cloud hosts like cloud9ide.com, Joyent, Heroku, etc.

service-monitor is written in javascript targeting node.js deployment.  It is designed as a remote agent
and local client package. The agent exists to receive heartbeats from clients, as well as run remote
availability tests. Alerts and notices may be sent via email.

## Goals
 - Monitoring:
   - HTTP: header response via curl
   - PING: monitor
   - HEARTBEAT: client checkin for local service availability
 - Alerts: email notification for test failures
 - Reporting:
   - Storage of logs on remote couchdb target
   - delivery of reports as json package
 - Configuration:
   - json based config file support
   - definition of monitors and agents
   - alerts and reporting levels
   - email notification targets
   - custom reports


