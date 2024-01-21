# A+chiever
A+chiever is a node-based education framework

### Requirements
* Angular CLI
* Python 3.10 or newer
* Docker Desktop
* All library requirements are present in included in the *requirements.txt* file. Instructions on how to download these included in the Setup section.

### Setup
**NOTE:** If you have multiple versions of Python installed, you may have to change the given commands slightly to specify your version. *pip3.x* and *py -3.x* should work as alternatives to *pip* and *python* aliases.

A+chiever utilizes a Python virtual environment to aid in dependency resolution.

1. Install Python 3.10 or newer
2. Install Angular [here](https://angular.io/guide/setup-local)
3. Pull down the most recent version of this repository to a local location.
4. Install PostgreSQL binaries if you don't have it installed already:
    ```
    Windows: https://www.postgresql.org/download/windows/
    Mac (requires brew [https://brew.sh/]): Run brew install postgresql
    ```
5. Setup environment (create .env and virtual environment):
    ```
    cd [repository]
    ./setup.sh
    ./run.sh
    ```

NOTE: if on Windows, shell scripts should be run in Git Bash to ensure compatibility.

### Running pytest
A+chiever utilizes the pytest framework to implement a test suite. To run, either use the *run_test_suite.sh* script or use the following commands:
1. Activate Python virtual environment:
```
cd [repository]/backend
Windows: .venv\Scripts\activate
Mac/Linux: source .venv/Scripts/activate
pytest
```

### Running CompoDoc Documentation
A+chiever utilizes CompoDoc to automatically generate documentation for the Angular web application. To run this documentation
either use the *run_docs.sh* script or use the following commands:
```
cd [repository]/frontend
npm run compodoc:serve-and-build
```

### Helpful Tools
* [PGAdmin](https://www.pgadmin.org/download/) - GUI for interacting with PostgreSQL database. Makes debugging and backend testing much easier.

### Helpful Links/Docs
* [Pydantic Dev Docs](https://docs.pydantic.dev/latest/) - Docs for Pydantic, the tool we use for backend validation and transformation

* [Angular DevTools](https://angular.dev/tools/devtools) - This is a useful browser extension for debugging angular applications.

### Other Tips
* FastAPI endpoints can quickly be tested locally without requiring the front-end by either visiting localhost:8000/docs or with the use of third-party tools such as [Postman](https://www.postman.com/).