# MOGNO - Ipê module
Description
===========
This module is responsible for fowarding machine creation and destruction requests
to Nogueira (responsible for managing containers). See our architecture specs for more 
details on the Ipê module

Installation and Running
============
`npm install`
`gulp serve`

Interfaces
==========

* GET container()
* POST container()
* DELETE container()

Testing
=======

* Debugging shortcuts, please keep this up to date.

```
curl -X POST http://localhost:8000/container/ -d '{"hello":"world"}' -H "Content-Type: application/json"
```

```
curl -X DELETE http://localhost:8000/container/ -d '{"hello":"world"}' -H "Content-Type: application/json"
```

```
curl -X GET http://localhost:8000/container/ -d '{"hello":"world"}' -H "Content-Type: application/json"
```