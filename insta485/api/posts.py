"""REST API for posts."""
import hashlib
import flask
from flask import (request, abort, jsonify, make_response, Response)
#from werkzeug.exceptions import HTTPException
import insta485


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
def create_comment():
    """Create a new comment based on the given postid and text."""
    # Check log in
    username = check_login()
    connection = insta485.model.get_db()

    # Gain the parameters
    text = request.json.get("text")
    post_id = request.args.get("postid", default=-1, type=int)
    if post_id < 0:
        return customer_error(400)
    check_post = connection.execute(
        "SELECT * FROM posts WHERE postid = ?", (post_id,)
    )
    curr_post = check_post.fetchone()
    if curr_post is None or len(curr_post) == 0:
        return customer_error(404)

    # Insert Data
    connection.execute(
        "INSERT INTO comments(owner, postid, text) VALUES "
        "(?, ?, ?)", (username, post_id, text,)
    )

    # Return the latest data? How to deal with multi-clients?
    new_comment = connection.execute(
        "SELECT last_insert_rowid() AS commentid"
    ).fetchone()

    context = {
        "commentid": new_comment["commentid"],
        "lognameOwnsThis": True,
        "owner": username,
        "ownerShowUrl": "/users/" + username + "/",
        "text": text,
        "url": "/api/v1/comments/" + str(new_comment["commentid"]) + '/'
    }
    return jsonify(**context), 201


@insta485.app.route('/api/v1/comments/<int:commentid_slug>/', methods=["DELETE"])
def delete_comment(commentid_slug):
    """Create a new comment based on the given commentid."""
    username = check_login()
    connection = insta485.model.get_db()

    comment_result = connection.execute(
        "SELECT commentid FROM comments WHERE commentid = ?",
        (commentid_slug,)
    )
    if comment_result.fetchone() is None:
        return '', 204

    connection.execute(
        "DELETE FROM comments WHERE commentid = ?",
        (commentid_slug,)
    )
    return '', 204


@insta485.app.route('/api/v1/likes/', methods=["POST"])
def create_like():
    """Like a post based on the postid given in the query string."""
    username = check_login()
    connection = insta485.model.get_db()

    post_id = request.args.get("postid", default=-1, type=int)
    if post_id < 0:
        return customer_error(400)
    check_post = connection.execute(
        "SELECT * FROM posts WHERE postid = ?", (post_id,)
    )
    curr_post = check_post.fetchone()
    if curr_post is None or len(curr_post) == 0:
        return customer_error(404)
    
    like_result = connection.execute(
        "SELECT owner FROM likes WHERE postid = ?", (post_id,)
    )
    likes = like_result.fetchall()

    if {"owner": username} in likes:
        return customer_error(409)
    connection.execute(
        "INSERT INTO likes(owner, postid) VALUES "
        "(?, ?)", (username, post_id,)
    )
    new_like_result = connection.execute(
        "SELECT likeid FROM likes WHERE postid = ? AND owner = ?",
        (post_id, username,)
    )
    new_like = new_like_result.fetchone()

    context = {
        "likeid": new_like["likeid"],
        "url": "/api/v1/likes/" + str(new_like["likeid"]) + '/' 
    }
    return jsonify(**context), 201


@insta485.app.route('/api/v1/likes/<int:likeid_slug>/', methods=["DELETE"])
def delete_like(likeid_slug):
    """Delete a post based on the likeid given."""
    username = check_login()
    connection = insta485.model.get_db()

    like_result = connection.execute(
        "SELECT likeid FROM likes WHERE likeid = ?", (likeid_slug,)
    )
    curr_like = like_result.fetchone()
    if curr_like is None:
        return '', 204
    
    connection.execute(
        "DELETE FROM likes WHERE likeid = ?", (likeid_slug,)
    )
    return '', 204
