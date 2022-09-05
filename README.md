# Introduction

**chobi**-A Social Media app api bootstrapped with **_<span style={color:red}>Express JS </span>_** and **_MonogoDB_**.

# 🎯 Purpose of the Project

The salient purpose of this project is learning. While building this api i tried to have a firm grasp on below topics:

1. Node.js/Exprss.js <br />
2. MonogDB <br />

# ⛲ Features

Register user <br />
User authentication🔒<br />
User authorization with JWT <br />
Update user info<br/>
Reset user password <br/>
Create/Read/Update/Delete post<br />
Create/Read/Update/Delete comment<br />
Like/Unlike a post <br />
Follow user<br />
Un-follow user<br />

# 🧰 Technologies Used:

Express JS & MongoDB

# 😇 Routes:

1. @desc Register new user-> @route POST /api/auth/registe-> @access Public
2. @desc login user-> @route POST /api/auth/login-> @access Public
3. @desc logout user-> @route GET /api/auth/logut-> @access private
4. @desc Refresh token-> @route GET /api/auth/refresh-> @access private
5. @desc Create a new post-> @route POST /api/post/-> @access private
6. @desc get Timeline posts-> @route GET /api/post/-> @access private
7. @desc get a single post-> @route GET /api/post/:post_id-> @access private
8. @desc Delete a post-> @route DELETE /api/post/:post_id-> @access private
9. @desc update a post-> @route PUT /api/post/:post_id-> @access private
10. @desc get all comments-> @route GET /api/post/:id/comments-> @access private
11. @desc update a comment-> @route PUT /api/post/:post_id/comment/:comment_id-> @access private
12. @desc Delete a comment-> @route DELETE /api/post/:post_id/comment/:comment_id-> @access private
13. @desc like/unlike a post-> @route PUT /api/post/:post_id/like-> @access private
14. @desc get logged in users info-> @route GET /api/user/-> @access Private
15. @desc get single users info-> @route GET /api/user/:id-> @access Private
16. @desc update user info-> @route PUT /api/user/:id-> @access Private
17. @desc reset user password-> @route PUT /api/user/reset-> @access Private
18. @desc delete user-> @route DELETE /api/user/delete/:id-> @access Private
19. @desc follow user-> @route PUT /api/user/follow/-> @access Private
20. @desc unfollow user-> @route PUT /api/user/unfollow/-> @access Private
