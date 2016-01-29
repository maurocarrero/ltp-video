# ltp-video

Just testing HTML5 video API with AngularJS and other stuff.
The feature is wrapped in a directive.
It has little features so far:
1. Take pictures
2. Download pictures using the API
3. Applying CSS filters to the video output (without affecting the saved pic).

### Clone this repo

Clone this repository using [git][git]:

* CHANGE THE REPO
```
git clone https://github.com/maurocarrero/ltp-video.git
cd ltp-video
```

### Install Dependencies

This repo is partially based on angular-seed repo, refer to it for further info:

https://github.com/angular/angular-seed.git

Install "concurrently" library globally for running both, API server on port 3000 and client server on port 8000.

```
npm install -g concurrently
```

Running "start" script will download bower and npm dependencies, and start both servers as well.

```
npm start
```

Now browse to the app at `http://localhost:8000/app/index.html`.
