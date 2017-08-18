var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var favicon = require('favicon');
app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
var session = require('express-session');

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use('/', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/', express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use('/', express.static(__dirname + '/node_modules/font-awesome'));
app.use('/', express.static(__dirname + '/node_modules/jquery-validation/dist'));
app.use('/', express.static(__dirname + '/node_modules/jquery-bootgrid/dist'));
app.use('/', express.static(__dirname + '/node_modules/bootstrap-datepicker/dist'));
app.use('/', express.static(__dirname + '/node_modules/jquery-confirm/dist'));
app.use(session({
  secret: 'rreteyurtettyietfga345664363'
}))


var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
// Connection URL
var url = 'mongodb://chatethakhun:Jack1234@ds038319.mlab.com:38319/income';
// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  db.close();
});


// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/login', function(require, response) {
  if(session.auth == "Who!!!!!!!") {
    response.render('pages/insert');
  }else {
    response.render('pages/login');
  }


});

app.post('/auth',function(require, response){
MongoClient.connect(url, function(err, db) {
  var cursor = db.collection("user").find({username : require.body.username, password : require.body.password});
  cursor.forEach(function(item) {
      console.log(item.username);
   if(item.username == require.body.username && item.password == require.body.password ){

     console.log("Access");
     session.id = item._id;
     session.auth = "Who!!!!!!!";
     response.render('pages/insert');
   }else {
        response.redirect('/login');
   }
    });
  db.close();
});
});
app.get('/', function(require, response) {
  response.render('pages/index');
});

app.get('/insertform', function(require, response) {

  if(session.auth == "Who!!!!!!!") {
    response.render('pages/insert');
  }else {
    response.render('pages/login');
  }
});

app.get('/view', function(require, response) {

    if(session.auth == "Who!!!!!!!") {
      response.render('pages/view');
    }else {
      response.redirect('/login');
    }

});
app.get('/logout',function (require,response) {
  delete session.auth == "Who!!!!!!!";
  //session.destroy;
  //require.session = null;
  //console.log(require.session.destroy());
  response.redirect('/login');
})
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});




app.post('/insert',function(require, response) {
  MongoClient.connect(url, function(err, db) {
    //console.log(db.collection("user").find()[1]._id);
    assert.equal(null, err);

     doc = {
       "income_id": ObjectId(session.id),
        "date": require.body.date,
        "income": require.body.income,
        "outcome": require.body.outcome,
        "incomedetail": require.body.incomedetail,
        "outcomedetail": require.body.outcomedetail
      };
      console.log(doc);
      db.collection("incomeDB").insert(doc, function() {
        console.log("added 1 document");
        response.redirect('/view');
        db.close();
      });
  });
});


app.get('/find',function(require, response) {
  response.setHeader('Content-Type', 'application/json');
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    if (require.query.searchPhrase == '') {
      //console.log();
      var cursor= db.collection("user").aggregate( [
        {$lookup: {localField: "_id",from: "incomeDB", foreignField: "income_id",as: "userinfo"}}]);
           // { incomedb: { $elemMatch: { income: 'eat' } } } );
      //console.log(userinfo);

      var countvalue = cursor;
      //countvalue.count().then((count) => {
      //  rownum = count;
      //});

      var arr = [];
      //console.log(require.query.searchPhrase);
      var offset = Math.floor((parseInt(require.query.current)-1)*(Math.sqrt(13) + Math.sqrt(5)));;
      cursor.skip(offset).limit(parseInt(require.query.rowCount));
       // เช็คว่า ถ้ามีค่า current = 0parseInt(require.query.current) - 1 + parseInt(require.query.rowCount)
       //console.log(cursor.readConcern());
       var name = [];
       var rownum = 0;
       cursor.forEach(function(item) {
         //console.log(item.username);
         name.push(item.username);

         item.userinfo.forEach(function(select) {
           //console.log(typeof select.income_id);
           //console.log(typeof session.id);
           //console.log(name);
           if (session.id.toString() == select.income_id) {

             rownum += 1;
             //console.log("Match");

             arr.push(select);
           }
         })

        //console.log(arr);
        //console.log(item);
      }, function(error) {
        console.log(rownum);
        response.send({
          current: parseInt(require.query.current),
          rowCount: parseInt(require.query.rowCount),
          rows: arr,
          total: rownum
        });
        db.close();
      });
    } else {
      console.log("Search Active");
      var cursor = db.collection("incomeDB").find({ incomedetail : {$regex: require.query.searchPhrase}});
      var rownum = 0;
      var countvalue = cursor;
      countvalue.count().then((count) => {
        rownum = count;
      });
      var arr = [];
      //console.log(require.query.searchPhrase);
      var offset = Math.floor((parseInt(require.query.current)-1)*(Math.sqrt(13) + Math.sqrt(5)));;
      cursor.skip(offset).limit(parseInt(require.query.rowCount));
       // เช็คว่า ถ้ามีค่า current = 0parseInt(require.query.current) - 1 + parseInt(require.query.rowCount)
       //console.log(cursor.readConcern());

       cursor.forEach(function(item) {
        arr.push(item);
        //console.log(item);
      }, function(error) {

        response.send({
          current: parseInt(require.query.current),
          rowCount: parseInt(require.query.rowCount),
          rows: arr,
          total: rownum
        });
        db.close();
      });
    }

  });
});
app.post('/delete/:id', function(require, response){
  response.setHeader('Content-Type', 'application/json');
  MongoClient.connect(url, function(err, db) {
      var doc = ObjectId(require.params.id);
      console.log(doc);
      db.collection('incomeDB').deleteOne( {_id: doc} , function() {
        db.close();
      });
  });
});
