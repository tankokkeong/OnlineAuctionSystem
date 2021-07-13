//Declare firestore database
var db = firebase.firestore();

//Global variables
let current_user_id = "";
let current_username = "";
let checked_login = false;
let firstTimeBidPage = true;

function submitNewBidding()
{
    var bidder_price = document.getElementById("bid-input").value;
    var error_prompt = document.getElementById("error-prompt");
    var error_count = 0;

    //Bid Time
    // Get Current Timestamp
    var date = new Date();

    var months_array = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Get hour, minute, and second
    var time = checkAMorPM(date.getHours(), checkTimeDigit(date.getMinutes()), checkTimeDigit(date.getSeconds()) );


    // Get date, month, and year
    var day = date.getDate(); 
    var month = months_array[date.getMonth()];
    var year = date.getFullYear();

    var bid_time = day + " " + month  + " " + year + ", " + time;


    //Bidder_price validation
    if(bidder_price == "")
    {
        error_prompt.innerHTML = "Bid amount is required!";
        error_count++;
    }
    else
    {
        error_prompt.innerHTML = "";
        bidder_price = parseInt(bidder_price);
    }

    //Check if the user is logged in
    if(checked_login)
    {
        if(error_count == 0)
        {
            var bidDoc = firestore.collection("bidList");

            bidDoc.orderBy("BidPrice", "desc").get().then((querySnapshot) => {

                if(querySnapshot.docs.length > 0)
                {
                    console.log(querySnapshot.docs[0].data().BidPrice + " COMPARE " + bidder_price)

                    if(bidder_price < querySnapshot.docs[0].data().BidPrice + 5)
                    {
                        error_prompt.innerHTML = "Your bid price is lower than the highest bidder!";
                    }
                    else
                    {
                        bidDoc.doc().set({
                            BidderName : current_username,
                            BidPrice : bidder_price,
                            BidTime : bid_time,
                        });

                        //Display submit bid alert
                        displaySubmitBidAlert();
                    }
                }
                else
                {
                    bidDoc.doc().set({
                        BidderName : current_username,
                        BidPrice : bidder_price,
                        BidTime : bid_time,
                    });

                    //Display submit alert
                    displaySubmitBidAlert();
                }
                
        
            });
        }
    }
    else
    {
        error_prompt.innerHTML = "Please login to start bidding!";
    }
    

}

function displayBidList()
{
    var bid_list = document.getElementById("bidding-list");
    var bidDoc = firestore.collection("bidList");
    //var loading_spinner = document.getElementById("loading-spinner");


    bidDoc.orderBy("BidPrice", "desc").onSnapshot((querySnapshot) => {


        //Display loader
        //loading_spinner.style.display = "";

        //row count
        var row_count = 0;

        //bidDoc.orderBy("bid_price", "desc").limit(10).get().then((querySnapshot) => {

        bidDoc.orderBy("BidPrice", "desc").get().then((querySnapshot) => {
            
            //Remove previous value 
            bid_list.innerHTML = "";

            //Destroy the old Datatable
            destroyDatatable();

            //Remove loader
            //loading_spinner.style.display = "none";

            querySnapshot.forEach((bid) => {
                row_count++;
    
                if(row_count == 1)
                {
                    bid_list.innerHTML = bid_list.innerHTML + 
                    "<tr>" +
                    "<th scope='row'>" + row_count + "</th>" + 
                    "<td>" + bid.data().BidderName + "</td>" +
                    "<td> $" + priceFormatter(bid.data().BidPrice) + "</td>" +
                    "<td>" + bid.data().BidTime + "</td>" + 
                    "</tr>"; 

                    //Update current bid amount
                    updateCurrentBid(bid.data().BidPrice);

                    //Display outbid alert
                    outbidAlert(bid.data().BidderName);
                }
                else
                {
                    bid_list.innerHTML = bid_list.innerHTML + 
                    "<tr>" +
                    "<th scope='row'>" + row_count + "</th>" + 
                    "<td>" + bid.data().BidderName + "</td>" +
                    "<td> $" + priceFormatter(bid.data().BidPrice) + "</td>" +
                    "<td>" + bid.data().BidTime + "</td>" + 
                    "</tr>"; 
                }
               
            });

            if(querySnapshot.docs.length == 0)
            {
                bid_list.innerHTML = "<tr>" +
                "<th scope='row' colspan='4'> No bid history now</th>" + 
                "</tr>"; 
            }

            //Display table
            initializeDataTable();

        });

        

        
    });


}

function priceFormatter(price)
{
    return Number(price).toLocaleString("en-GB");
}

function SignUpAccount(){
    var username = document.getElementById("username").value;
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirm-password").value;
    var fullName = document.getElementById("full-name").value;
    var addressLine1 = document.getElementById("address-line-1").value;
    var addressLine2 = document.getElementById("address-line-2").value;
    var city = document.getElementById("city").value;
    var country = document.getElementById("country").value;
    var phoneNumber = document.getElementById("phone-number").value;
    var accountType = document.getElementById("account-type").value;

    //Validation
    var characters_validation = /^[ A-Za-z]+$/;
    var digit_validation = /^[0-9]+$/;
    var email_validation = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    var hasNumber = /\d/;
    var hasCharacter = /[a-zA-Z]/;

    //Error Prompt
    var error_prompt = document.getElementsByClassName("error-prompt");
    var signup_error = document.getElementById("signup-error");
    var error_count = 0;

    //Loader
    var signup_loader = document.getElementById("signup-loader");

    //Display loader
    signup_loader.style.display = "";

    //Username validation
    if(username === "")
    {
        error_prompt[0].innerHTML = "Username cannot be empty!";
        error_count++;
    }
    else if (characters_validation.test(username) === false)
    {
        error_prompt[0].innerHTML = "Username should only contain characters!";
        error_count++;
    }
    else
    {
        error_prompt[0].innerHTML = "";
    }

    //Email validation
    if(email === "")
    {
        error_prompt[1].innerHTML = "Email cannot be empty!";
        error_count++;
    }
    else if(email_validation.test(email) === false)
    {
        error_prompt[1].innerHTML = "This email format is invalid!";
        error_count++;
    }
    else
    {
        error_prompt[1].innerHTML = "";
    }

    //Password validation
    if(password === "")
    {
        error_prompt[2].innerHTML = "Password cannot be empty!";
        error_count++;
    }
    else if (password.length < 6)
    {
        error_prompt[2].innerHTML = "Password length cannot be lesser than 6!";
        error_count++;
    }
    else if (hasNumber.test(password) === false)
    {
        error_prompt[2].innerHTML = "Password should contain at least one number!";
        error_count++;
    }
    else if(hasCharacter.test(password) === false)
    {
        error_prompt[2].innerHTML = "Password should contain at least one character!";
        error_count++;
    }
    else
    {
        error_prompt[2].innerHTML = "";
    }

    //Confirm Password validation
    if(confirmPassword === "")
    {
        error_prompt[3].innerHTML = "Confirm password cannot be empty!";
        error_count++;
    }
    else if(confirmPassword !== password)
    {
        error_prompt[3].innerHTML = "Confirm password does not match with password!";
        error_count++;
    }
    else
    {
        error_prompt[3].innerHTML = "";
    }

    //Full name validation
    if(fullName === "")
    {
        error_prompt[4].innerHTML = "Full name cannot be empty!";
        error_count++;
    }
    else if(characters_validation.test(fullName) === false)
    {
        error_prompt[4].innerHTML = "Full name can only contain characters!";
        error_count++;
    }
    else
    {
        error_prompt[4].innerHTML = "";
    }


    //Address Line 1 validation
    if(addressLine1 === "")
    {
        error_prompt[5].innerHTML = "Address line 1 cannot be empty!";
        error_count++;
    }
    else
    {
        error_prompt[5].innerHTML = "";
    }

    //City validation
    if(city === "")
    {
        error_prompt[7].innerHTML = "City cannot be empty!";
        error_count++;
    }
    else
    {
        error_prompt[7].innerHTML = "";
    }

    //Country validation
    if(country === "")
    {
        error_prompt[8].innerHTML = "Country cannot be empty!";
        error_count++;
    }
    else
    {
        error_prompt[8].innerHTML = "";
    }

    //Phone number validation
    if(phoneNumber === "")
    {
        error_prompt[9].innerHTML = "Phone number cannot be empty!";
        error_count++;
    }
    else if(digit_validation.test(phoneNumber) === false)
    {
        error_prompt[9].innerHTML = "Phone number should only contain numbers!";
        error_count++;
    }
    else
    {
        error_prompt[9].innerHTML = "";
    }
    
    //If no error then sign up
    if(error_count === 0)
    {
        firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((user) => {

            firebase.auth().onAuthStateChanged(function(user) {
                if (user)
                {
                   // Add a new document in collection "users"
                    db.collection("users").doc(user.uid).set({
                        Username: username,
                        Email: email,
                        FullName: fullName,
                        AddressLine1: addressLine1,
                        AddressLine2: addressLine2,
                        City: city,
                        Country: country,
                        PhoneNumber : phoneNumber,
                        AccountType: accountType
                    })
                    .then(() => {
                        console.log("Document successfully written!");

                        // Signed in 
                        window.location.href = "login.html?loginNow";
                    })
                    .catch((error) => {
                        console.error("Error writing document: ", error);
                    });
                }
            });
            
        })
        .catch((error)=>{
            signup_error.innerHTML = error.message;

            //Remove Loader
            signup_loader.style.display = "none";
        });
    }
    else
    {
        //Remove Loader
        signup_loader.style.display = "none";
    }

}

function login()
{
    email = document.getElementById("email").value;
    password = document.getElementById("password").value;
    error_prompt = document.getElementsByClassName("error-prompt");
    login_loader = document.getElementById("login-loader");
    error_count = 0;

    // Display Loader
    login_loader.style.display = "";

    // Clear the error prompt
    error_prompt.innerHTML = "";

    if(email === "")
    {
        //Remove loader
        login_loader.style.display = "none";

        // Display error
        error_prompt[0].innerHTML = "Email cannot be empty!";

        error_count++;
    }
    else
    {
        //Remove error
        error_prompt[0].innerHTML = "";
    }


    if (password === "")
    {
        //Remove loader
        login_loader.style.display = "none";

        // Display error
        error_prompt[1].innerHTML = "Password cannot be empty!";

        error_count++;
    }
    else
    {
        //Remove error
        error_prompt[1].innerHTML = "";
    }

    //If no error
    if(error_count === 0)
    {
        firebase.auth().signInWithEmailAndPassword(email, password)
        .then((user) => {
            // Signed in 
            window.location.href = "home.html";
        })
        .catch((error) => {
            // var errorCode = error.code;
            // var errorMessage = error.message;

            //Remove loader
            login_loader.style.display = "none";

            // Display error
            error_prompt[1].innerHTML = "Invalid username or password!";
        });
    }
    
}

function checkSignIn()
{
    var user_status = document.getElementsByClassName("nav-item");

    // Check Login
    firebase.auth().onIdTokenChanged(function(user) {
        if (user) {
            // User is signed in or token was refreshed.
            checked_login = true;

            if(user_status != null)
            {
                //Show my profile and logout button
                user_status[1].innerHTML = '<a class="nav-link" href="myprofile.html">My profile</a>';
                user_status[2].innerHTML = '<a class="nav-link" onclick=\'logout()\' href="">Logout</a>';
            }   

            current_user_id = user.uid;

            //Get User Info
            getUserInfo(current_user_id);
        }
        else
        {
            if(user_status != null){
                user_status[1].innerHTML = '<a class="nav-link" href="login.html">Login</a>';
            }
        }
    });

}

function logout()
{
    firebase.auth().signOut();
}

function getUserInfo(user_id)
{
    var UserRef = firestore.collection("users").doc(user_id);

    UserRef.get().then((doc) => {
        if (doc.exists) {
            //Assign user info to the global variables
            current_user_id = user_id;
            current_username = doc.data().Username;
            current_user_email = doc.data().Email;

            console.log("success")
        }

        
    }).catch((error) => {
        console.log("Error getting document:", error);
    });

}

function checkTimeDigit(i)
{
	if(i<10)
	{
		i="0"+i;
	}
	
	return i;
}

function checkAMorPM(hour, minute, second)
{
    if(hour < 12)
    {
        return checkTimeDigit(hour) + ":" + minute + ":" + second +" AM";
    }
    else
    {
        return checkTimeDigit(hour - 12) + ":" + minute + ":" + second + " PM";
    }
}

function initializeDataTable(){

    $(document).ready( function () {
        //Create new Datatable
        $('#bidding-history-table').DataTable();

    } );
}

function destroyDatatable(){
    $('#bidding-history-table').DataTable().clear().destroy();
}

function displaySubmitBidAlert()
{
    var outbid_alert = document.getElementById("submit-alert");

    //Display submit bid alert
    outbid_alert.innerHTML = 
    '<div class="alert alert-success alert-dismissible fade show" role="alert">' +
        'Successfully submit your bid!' + 
        '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
            '<span aria-hidden="true">&times;</span>' +
        '</button>' +
    '</div>';

    //Clear input
    document.getElementById("bid-input").value = "";
}

function updateCurrentBid(bidAmount)
{
    var currentBidAmount = document.getElementById("current-bid-amount");
    var placeBidMessage = document.getElementById("place-bid-message");

    //Update current Bid Amount
    currentBidAmount.innerHTML = "$ " + bidAmount;
    placeBidMessage.innerHTML = "place $ " + (bidAmount + 5) + " or more";
}

function outbidAlert(outbidder)
{
    var outbidAlert = document.getElementById("outbid-alert");
    var outbidAudio = document.getElementById("outbid-audio");

    //Display outbid message
    outbidAlert.innerHTML = outbidder + " just outbids everyone in this bidding!";

    if(firstTimeBidPage === true)
    {
        firstTimeBidPage = false;
    }
    else
    {
        // Display outbid alert audio
        outbidAudio.play();
    }

}

function enterSignIn()
{
    if (event.keyCode === 13) {
        event.preventDefault();
        login();
    }
}