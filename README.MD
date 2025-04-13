# DevTinder APIs

## authRouter
 - POST /signup
 - POST /login
 - POST /logout

## profileRouter
 - GET /profile/view
 - PATCH /profile/edit
 - PATCH /profile/password

## connectionRequestRouter
 - POST /request/send/interested/:userId
 - POST /request/send/ignore/:userId
 - POST /request/send/accepted/:requestId
 - POST /request/send/rejected/:requestId

## userRouter
 - GET /user/connections 
 - GET /user/request
 - GET /user/feed - GET you the profiles of the other user on platform

 