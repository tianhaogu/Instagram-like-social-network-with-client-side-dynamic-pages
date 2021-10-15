"""REST API for posts."""
import hashlib
import flask
from flask import (request, abort, jsonify, make_response, Response)
#from werkzeug.exceptions import HTTPException
import insta485


# @insta485.app.route('/api/v1/posts/<int:postid_url_slug>/')
# def get_post(postid_url_slug):
#     """Return post on postid.
#     Example:
#     {
#       "age": "2017-09-28 04:33:28",
#       "img_url": "/uploads/122a7d27ca1d7420a1072f695d9290fad4501a41.jpg",
#       "owner": "awdeorio",
#       "owner_img_url": "/uploads/e1a7c5c32973862ee15173b0259e3efdb6a391af.jpg",
#       "owner_show_url": "/users/awdeorio/",
#       "post_show_url": "/posts/1/",
#       "url": "/api/v1/posts/1/"
#     }    """
#     context = {
#         "age": "2017-09-28 04:33:28",
#         "img_url": "/uploads/122a7d27ca1d7420a1072f695d9290fad4501a41.jpg",
#         "owner": "awdeorio",
#         "owner_img_url": "/uploads/e1a7c5c32973862ee15173b0259e3efdb6a391af.jpg",
#         "owner_show_url": "/users/awdeorio/",
#         "postid": "/posts/{}/".format(postid_url_slug),
#         "url": flask.request.path,
#     }
#     return flask.jsonify(**context)


def check_exist(username, password):
    """Check whether the login username and password exist."""
    connection = insta485.model.get_db()
    user_result = connection.execute(
        "SELECT username, password FROM users WHERE username = ?", (username,)
    )
    login_user = user_result.fetchone()
    if login_user is None or len(login_user) == 0:
        return False
    
    (algorithm, salt, password_hash_db) = login_user['password'].split('$')
    hash_obj = hashlib.new(algorithm)
    password_salted = salt + password
    hash_obj.update(password_salted.encode('utf-8'))
    password_hash = hash_obj.hexdigest()
    if password_hash != password_hash_db:
        return False
    return True


def customer_error(status_code):
    """Return specific error message and status code."""
    if status_code == 400:
        output = "Bad Request"
    if status_code == 403:
        output = "Forbidden"
    if status_code == 404:
        output = "Not Found"
    if status_code == 409:
        output = "Conflict"
    message = {
        "message": output,
        "status_code": status_code
    }
    return jsonify(**message), status_code


# Kyle:I add this function to avoid style check?
def check_login():
    """A function to check the login before other operation"""
    if (not request.authorization) and (not flask.session):
        return customer_error(403)
    if not flask.session:
        username = request.authorization['username']
        password = request.authorization['password']
        if not username or not password\
                or not check_exist(username, password):
            return customer_error(403)
    else:
        if "logname" not in flask.session:
            return customer_error(403)
        username = flask.session["logname"]
    return username



@insta485.app.route('/api/v1/posts/<int:postid_url_slug>/', methods=["GET"])
def get_post(postid_url_slug):
    """Return post on postid."""
    if (not request.authorization) and (not flask.session):
        return customer_error(403)
    if not flask.session:
        username = request.authorization['username']
        password = request.authorization['password']
        if not username or not password\
                or not check_exist(username, password):
            return customer_error(403)
    else:
        if "logname" not in flask.session:
            return customer_error(403)
        username = flask.session["logname"]
    connection = insta485.model.get_db()

    post_result = connection.execute(
        "SELECT P.postid, P.filename AS Pfilename, P.owner, P.created, "
        "U.filename AS Ufilename FROM posts P JOIN users U "
        "ON P.owner = U.username WHERE P.postid = ?", (postid_url_slug,)
    )
    curr_post = post_result.fetchone()
    if curr_post is None or len(curr_post) == 0:
        return customer_error(404)

    like_info = connection.execute(
        "SELECT likeid, owner FROM likes "
        "WHERE postid = ?", (postid_url_slug,)
    )
    all_likes = like_info.fetchall()
    like_id = None
    for all_like in all_likes:
        if all_like["owner"] == username:
            like_id = all_like["likeid"]
            break
    
    comment_info = connection.execute(
        "SELECT commentid, owner, text FROM comments "
        "WHERE postid = ?", (postid_url_slug,)
    )
    all_comments = comment_info.fetchall()
    for all_comment in all_comments:
        if all_comment["owner"] == username:
            all_comment["lognameOwnsThis"] = True
        else:
            all_comment["lognameOwnsThis"] = False
        all_comment["ownerShowUrl"] = "/users/"\
            + str(all_comment["owner"]) + '/'
        all_comment["url"] = "/api/v1/comments/"\
            + str(all_comment["commentid"]) + '/'
    
    context = {
        "comments": all_comments,
        "created": curr_post["created"],
        "imgUrl": "/uploads/" + curr_post["Pfilename"],
        "likes": {
            "lognameLikesThis": True if like_id != None else False,
            "numLikes": len(all_likes),
            "url": "/api/v1/likes/" + str(like_id) + '/'\
                if like_id != None else like_id
        },
        "owner": curr_post["owner"],
        "ownerImgUrl": "/uploads/" + curr_post["Ufilename"],
        "ownerShowUrl": "/users/" + curr_post["owner"] + '/',
        "postShowUrl": "/posts/" + str(curr_post["postid"]) + '/',
        "postid": curr_post["postid"],
        "url": request.path
    }
    return jsonify(**context)


@insta485.app.route('/api/v1/posts/', methods=["GET"])
def get_posts():
    """Return post on query parameters."""
    if (not request.authorization) and (not flask.session):
        return customer_error(403)
    if not flask.session:
        username = request.authorization['username']
        password = request.authorization['password']
        if not username or not password\
                or not check_exist(username, password):
            return customer_error(403)
    else:
        if "logname" not in flask.session:
            return customer_error(403)
        username = flask.session["logname"]
    query = request.query_string.decode('utf-8')
    connection = insta485.model.get_db()

    size = request.args.get("size", default=10, type=int)
    page = request.args.get("page", default=0, type=int)
    postid_lte = request.args.get("postid_lte", default=1000000, type=int)
    if size < 0 or page < 0:
        return customer_error(400)
    
    begin_record = size * page # should be size * (page + 1 - 1) + 1 - 1
    post_result = connection.execute(
        "SELECT P.postid, P.filename AS Pfilename, P.owner, P.created, "
        "U.filename AS Ufilename FROM posts P JOIN users U "
        "ON P.owner = U.username WHERE (P.owner = ? OR P.owner IN "
        "(SELECT F.username2 FROM following F WHERE F.username1 = ?)) "
        "AND P.postid <= ? ORDER BY P.postid DESC LIMIT ? OFFSET ?",
        (username, username, postid_lte, size, begin_record,)
    )
    all_posts = post_result.fetchall()

    result_list = []
    if all_posts is not None and len(all_posts) != 0:
        for curr_post in all_posts:
            like_info = connection.execute(
                "SELECT likeid, owner FROM likes "
                "WHERE postid = ?", (curr_post["postid"],)
            )
            all_likes = like_info.fetchall()
            like_id = None
            for all_like in all_likes:
                if all_like["owner"] == username:
                    like_id = all_like["likeid"]
                    break
            
            comment_info = connection.execute(
                "SELECT commentid, owner, text FROM comments "
                "WHERE postid = ?", (curr_post["postid"],)
            )
            all_comments = comment_info.fetchall()
            for all_comment in all_comments:
                if all_comment["owner"] == username:
                    all_comment["lognameOwnsThis"] = True
                else:
                    all_comment["lognameOwnsThis"] = False
                all_comment["ownerShowUrl"] = "/users/"\
                    + all_comment["owner"] + '/'
                all_comment["url"] = "/api/v1/comments/"\
                    + str(all_comment["commentid"]) + '/'
            
            curr_json = {
                "comments": all_comments,
                "created": curr_post["created"],
                "imgUrl": "/uploads/" + curr_post["Pfilename"],
                "likes": {
                    "lognameLikesThis": True if like_id != None else False,
                    "numLikes": len(all_likes),
                    "url": "/api/v1/likes/" + str(like_id) + '/'\
                        if like_id != None else like_id
                },
                "owner": curr_post["owner"],
                "ownerImgUrl": "/uploads/" + curr_post["Ufilename"],
                "ownerShowUrl": "/users/" + curr_post["owner"] + '/',
                "postShowUrl": "/posts/" + str(curr_post["postid"]) + '/',
                "postid": curr_post["postid"],
                "url": "/api/v1/posts/" + str(curr_post["postid"]) + '/'
            }
            result_list.append(curr_json)
        next_postid_lte = all_posts[0]["postid"] if postid_lte == 1000000\
            else postid_lte
    
    context = {
        "next": '' if all_posts is None or len(all_posts) < size
            else "/api/v1/posts/" + (
                "?size={}&page={}&postid_lte={}".format(
                size, page + 1, next_postid_lte)
            ),
        "results": result_list,
        "url": request.path if query == '' else request.path + '?' + query
    }
    return jsonify(**context)


@insta485.app.route('/api/v1/', methods=["GET"])
def get_index():
    context = {
        "comments": "/api/v1/comments/",
        "likes": "/api/v1/likes/",
        "posts": "/api/v1/posts/",
        "url": "/api/v1/"
    }
    return jsonify(**context)

@insta485.app.route('/api/v1/comments/', methods=["POST"])
def post_comments():
    """Create a new comment based on the text in the JSON body for the specificed post id"""
    # Check log in
    username = check_login()
    
    # Gain the parameters
    text = request.json.get("text")
    postid = request.args.get("postid", default=-1, type=int)
    if(-1 == postid):
        return customer_error(400)
    
    query = request.query_string.decode('utf-8')
    connection = insta485.model.get_db()
    # Query the owner
    owner_result = connection.execute(
        "SELECT owner FROM posts "
        "WHERE postid = ?",
        [postid]
    )
    owner = owner_result.fetchone()['owner']

    # Insert Data
    connection.execute(
        "INSERT INTO comments "
        "VALUES (?, ?, ?)",
        [owner,postid,text]
    )

    # Query commentid_result(?why select recent row will not cause multi-thread problem)
    commentid_result = connection.execute(
        "SELECT commentid FROM comments "
        "WHERE owner = ? AND postid = ?",
        [owner,postid]
    )
    commentid = commentid_result.fetchone()['commentid']
    if owner == username:
        islognameOwnsThis = True
    else:
        islognameOwnsThis = False

    # Return value
    context = {
        "commentid":commentid,
        "lognameOwnsThis":islognameOwnsThis,
        "owner":owner,
        "ownerShowUrl":"/users/" + owner + "/",
        "text":text,
        "url":"/api/v1/comments/" + str(commentid)
    }
    return jsonify(**context), 201

@insta485.app.route('/api/v1/comments/<commentid>', methods=["DELETE"])
def delete_comments(commentid):
    """Create a new comment based on the text in the JSON body for the specificed post id"""
    # Check log in
    username = check_login()
    
    # Database Access
    query = request.query_string.decode('utf-8')
    connection = insta485.model.get_db()

    # Check before delete
    # Might use try except
    check = connection.execute(
        "SELECT FROM comments WHERE commentid = ?",
        [commentid]
    )
    if not (check.fetchone()):
        customer_error(400)


    # Delete commentid
    connection.execute(
        "DELETE FROM comments WHERE commentid = ?",
        [commentid]
    )

    # Return
    return Response(status= 204)

    
    


