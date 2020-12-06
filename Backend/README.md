# Achivi - Backend

The REST API runs local on port 8080.

### Start REST API on the server
1. Change directory to www/restapi
2. Start newt 
    ```sh
    $ newt restapi
    ```
3. Start the REST API on PORT=5001
    ```sh
    $ NODE_ENV='production' node restapi.js
    ```
4. Open in Browser [http://160.85.252.106/api/](http://160.85.252.106/api/) to verify it is running

### Stop REST API on the server
1. Press CTRL + C
2. Exit
    ```sh
    $ exit
    ```

## Installation
#### NPM
You can skip this step if you have already installed npm.\
Please follow this link [GET NPM](https://www.npmjs.com/get-npm) to install npm.

#### NodeJS
Install NodeJs if not installed yet.
```sh
$ sudo apt install nodejs
```

#### HTTP-SERVER
To run the RESTApi local on your computer you need to install http-server over the npm.
```sh
$ sudo npm install http-server -g
```

## Development
#### Start REST API local
1. Go into the "Achivi" folder
2. Change directory to Achivi/Backend/REST_API
3. Start the REST API on PORT=8080
    ```sh
    $ PORT=8080 node restapi.js
    ```
4. Open in Browser localhost:8080/api to verify it is running

#### Start http-server
1. Go into the "Achivi" folder
2. Change directory to Achivi/Backend/Test
3. Start http-server over port 8081
    ```sh
    $ http-server -p 8081
    ```
4. Open in Browser localhost:8081 to verify it is running