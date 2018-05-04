API_URL = 'http://localhost:3000/user';
IMAGERY_URL = 'http://localhost:80/api';
IMAGES_FOLDER = 'http://localhost:80/static/img';

const userController = {
    user : null
};


userController.login = (email, password) => {
    $.post(`${API_URL}/login`, {email, password}, (data) => {
        if (data.authenticated){
            userController.serializeUser(data.user);
            window.location.href = '../index.html';
        } else {
            document.getElementById('error_login').style.display = 'block';
            setTimeout(() => {
                document.getElementById('error_login').style.display = 'none';
            } , 5000);
        }

    });
};

userController.serializeUser = (user) => {
    sessionStorage.setItem('user', JSON.stringify( user));
};

userController.deserializeUser = () => {
    return userController.user || JSON.parse( sessionStorage.getItem('user'));
};

userController.setUser = (user) => {
    userController.serializeUser(user);
    userController.user = user;
};

userController.getFollowing = () => {
  $.get(`${API_URL}/${userController.user._id}/following`, (data) => {
      if(data){
          let following = data.following;
          let followingView = document.getElementById('following-list');
          for  (let user of following){
              userController.renderFollowing(followingView, user);
          }
      }
  });
};

userController.checkFollower = (user) => {
    return userController.user.following.includes(user._id);
};

userController.followUser = (_id) => {
   $.put(`${API_URL}/${userController.user._id}/follow`, {_id}, (data) => {
        if (data){
            userController.setUser(data);
            let el = document.getElementById(_id);
                el.innerHTML = `Done Kiitos !!! <i class="material-icons">favorite</i>`;
            setTimeout(()=>{
                el.parentNode.removeChild(el);
            }, 3000);
        }
  });
};

userController.unfollowUser = (_id) => {
    $.post(`${API_URL}/${userController.user.id}/unfollow`, {_id}, (data) => {
        if (data){
            console.log(data);
        }
    });
};


userController.renderFollowing = (followingView, user) => {
    followingView.innerHTML +=
        `<div class="team-player">
                 <div class="card card-plain">
                      <div class="col-md-6 ml-auto mr-auto">
                         <img src="${IMAGES_FOLDER}/default.png" alt="Thumbnail Image" class="img-raised rounded-circle img-fluid" >
                       </div>
                        <h4 class="card-title" >${user.firstname} ${user.lastname}
                        </h4>
                  </div>
          </div>`

};

userController.renderSearch = (usersView, user, toFollow) => {
    usersView.innerHTML +=
        `<li>
            <a class="image-wrapper" href="#0"><img src="./assets/img/placeholder.png" alt="User Image Profile"></a>
            <h4 >
                <a class="cd-nowrap" id="profile${user._id}" href="#0">${user.firstname} ${user.lastname}</a>
               ${toFollow? `<button id="${user._id}" class="btn btn-primary btn-round" onclick="userController.followUser(this.id)">
                   Follow <i class="material-icons">favorite</i> 
                </button>` :''}
            </h4>
            <time>${user.email}</time>
         </li>`
};

userController.searchUsers = (keyword) => {
    if (keyword){
        let usersView = document.getElementById('users-search');
        usersView.innerHTML = '';
        $.get(`${API_URL}/${keyword}/search`, (data) => {
            let toFollow = true; 
            for (let user of data){
                if(user._id == userController.user._id || userController.checkFollower(user)) toFollow = false;
                userController.renderSearch(usersView, user, toFollow);
                toFollow = true;
            }
        });
    }
};

const cameraController = {
    cameraRunning : true
};

cameraController.initCamera = (params, cameraContainer) => {
    Webcam.set(params);
    Webcam.attach(cameraContainer);
};

cameraController.process = () => {
    Webcam.snap((image ) => {
        if(cameraController.cameraRunning) {
            Webcam.freeze();
            this.cameraRunning = false;
            let context = document.getElementsByTagName('canvas')[0].getContext('2d');
            $.post(`${IMAGERY_URL}/process`, {image}, (data) => {
                cameraController.drawFace(context, data.rectangle, data.person);
            });
        }else{
            Webcam.unfreeze();
            cameraController.cameraRunning = true;
        }
    });
};

cameraController.drawFace = (context, rectangle, person) => {
    context.lineWidth = 4;
    context.strokeStyle = '#ff0000';
    context.font = '40px Arial';
    context.fillStyle = '#ff0000';
    context.fillText(`${person.firstname} ${person.lastname}`, rectangle.left + 20, rectangle.top - 20);
    context.rect(rectangle.left, rectangle.top, rectangle.right - rectangle.left, rectangle.bottom - rectangle.top);
    context.stroke();
};

