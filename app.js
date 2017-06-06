
var express = require("express"),
bodyParser = require('body-parser'),
errorHandler = require('errorhandler'),
Twitter = require('twitter'),
_ = require('underscore'),
rita = require('rita'),
Request = require('request'),
async = require("async");
var authors = ["Adam Lindsay Gordon","Alan Seeger","Alexander Pope","Algernon Charles Swinburne","Ambrose Bierce","Amy Levy","Andrew Marvell","Ann Taylor","Anne Bradstreet","Anne Bronte","Anne Killigrew","Anne Kingsmill Finch","Annie Louisa Walker","Arthur Hugh Clough","Ben Jonson","Charles Kingsley","Charles Sorley","Charlotte Bronte","Charlotte Smith","Christina Rossetti","Christopher Marlowe","Christopher Smart","Coventry Patmore","Edgar Allan Poe","Edmund Spenser","Edward Fitzgerald","Edward Lear","Edward Taylor","Edward Thomas","Eliza Cook","Elizabeth Barrett Browning","Emily Bronte","Emily Dickinson","Emma Lazarus","Ernest Dowson","Eugene Field","Francis Thompson","Geoffrey Chaucer","George Eliot","George Gordon, Lord Byron","George Herbert","George Meredith","Gerard Manley Hopkins","Helen Hunt Jackson","Henry David Thoreau","Henry Vaughan","Henry Wadsworth Longfellow","Hugh Henry Brackenridge","Isaac Watts","James Henry Leigh Hunt","James Thomson","James Whitcomb Riley","Jane Austen","Jane Taylor","John Clare","John Donne","John Dryden","John Greenleaf Whittier","John Keats","John McCrae","John Milton","John Trumbull","John Wilmot","Jonathan Swift","Joseph Warton","Joyce Kilmer","Julia Ward Howe","Jupiter Hammon","Katherine Philips","Lady Mary Chudleigh","Lewis Carroll","Lord Alfred Tennyson","Louisa May Alcott","Major Henry Livingston, Jr.","Mark Twain","Mary Elizabeth Coleridge","Matthew Arnold","Matthew Prior","Michael Drayton","Oliver Goldsmith","Oliver Wendell Holmes","Oscar Wilde","Paul Laurence Dunbar","Percy Bysshe Shelley","Philip Freneau","Phillis Wheatley","Ralph Waldo Emerson","Richard Crashaw","Richard Lovelace","Robert Browning","Robert Burns","Robert Herrick","Robert Louis Stevenson","Robert Southey","Robinson","Rupert Brooke","Samuel Coleridge","Samuel Johnson","Sarah Flower Adams","Sidney Lanier","Sir John Suckling","Sir Philip Sidney","Sir Thomas Wyatt","Sir Walter Raleigh","Sir Walter Scott","Stephen Crane","Thomas Campbell","Thomas Chatterton","Thomas Flatman","Thomas Gray","Thomas Hood","Thomas Moore","Thomas Warton","Walt Whitman","Walter Savage Landor","Wilfred Owen","William Allingham","William Barnes","William Blake","William Browne","William Cowper","William Cullen Bryant","William Ernest Henley","William Lisle Bowles","William Morris","William Shakespeare","William Topaz McGonagall","William Vaughn Moody","William Wordsworth"];


var app = express();
var version = rita.RiTa.VERSION;
console.log(version);

var lexicon = new rita.RiLexicon();


app.set("views", __dirname + '/views');
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(errorHandler());
var port = process.env.PORT || 3000;

var server = app.listen(port);

console.log('Express started on port ' + port);
//ROUTES
app.get("/", function(req, res){
	res.render('index');
});


app.get("/abstract", function(req, res){
	var currentAuthor = authors[Math.floor(Math.random()*authors.length)];
	currentAuthor = currentAuthor.replace(/\b \b/g, '%20');
	
	var theDBPoem;
	var poempluspos = [];
	res.header('Access-Control-Allow-Origin', "*");
	var requestURL = "http://poetrydb.org/author/" + currentAuthor;

	Request(requestURL, function (error, response, body) {
		if (error) throw error;
		var theData = JSON.parse(body);

		theDBPoem = theData[Math.floor(Math.random()*theData.length)].lines;
		for (var y = 0; y < theDBPoem.length; y++){
			var theDBPoemPOS = rita.RiTa.getPosTags(theDBPoem[y]);
			var word = rita.RiTa.tokenize(theDBPoem[y]);
			for (var x = 0; x < word.length; x++){
				var similars = lexicon.similarBySound(word[x]);
				var similars = _.shuffle(similars);
				for (var z = 0; z < similars.length; z++){
					if (theDBPoemPOS[x] == rita.RiTa.getPosTags(similars[z])){
						theDBPoem[y] = theDBPoem[y].replace(word[x], similars[z]);
						break;
					}
				}
			}
		}
		res.json(theDBPoem);
	});
});


app.post("/alpha", function(req, res){
	var input = req.body.body;
	console.log(input);
	var similarLet;
	var lines = rita.RiTa.tokenize(input);
	for (var y = 0; y < lines.length; y++){
		similarLet = lexicon.similarByLetter(lines[y]);
		lines[y]= rita.RiTa.untokenize(similarLet);
	}
	
	lines.sort();

	res.json(lines);
});

app.get("/cento", function(req, res){
	var item = [authors[Math.floor(Math.random()*authors.length)],authors[Math.floor(Math.random()*authors.length)],authors[Math.floor(Math.random()*authors.length)]];
	var inDex = [];
	var cento = [];
	async.parallel([
		function(callback) {
			Request("http://poetrydb.org/author/"+item[0]+"/title", function (err, response, body) {
				if (err) return callback(err);
				var theData = JSON.parse(body);
				for (var y = 0; y < theData.length; y++){
					inDex.push(theData[y].title);	
				}
				callback();
			});
	    },
	    function(callback) {
	        Request("http://poetrydb.org/author/"+item[1]+"/title", function (err, response, body) {
				if (err) return callback(err);
				var theData = JSON.parse(body);
				for (var y = 0; y < theData.length; y++){
					inDex.push(theData[y].title);	
				}
				callback();
			});
	    },
	    function(callback) {
			Request("http://poetrydb.org/author/"+item[2]+"/title", function (err, response, body) {
				if (err) return callback(err);
				var theData = JSON.parse(body);
				for (var y = 0; y < theData.length; y++){
					inDex.push(theData[y].title);	
				}
				callback();
			});
	    }],
	    function(err) {
	        if (err) return next(err); 

		    console.log("sorting");
			inDex.sort();
			console.log(inDex);
			var lineOne = Math.floor(Math.random()*((inDex.length)-5));
			console.log(lineOne);
			for (var z = 0; z < ((inDex.length)-lineOne); z++){
				cento.push(inDex[lineOne+z]);
			}
			res.json(cento);
	});
});


app.get("/sestina", function(req, res){
	var currentAuthor = authors[Math.floor(Math.random()*authors.length)];
	currentAuthor = currentAuthor.replace(/\b \b/g, '%20');
	var thetext = [];
	var sestina = [];
	var ttext = [];
	var wordy = [];
	var endings = [];
	res.header('Access-Control-Allow-Origin', "*");
	var requestURL = "http://poetrydb.org/author/" + currentAuthor;

	for (var i = 0; i < 6; i++){
		wordy.push(lexicon.randomWord('nn'));	
	}
	async.series([
		function(callback) {
			Request(requestURL, function (error, response, body) {
				if (error) return callback(error);
				var theData = JSON.parse(body);
				for (var i = theData.length - 1; i >= 0; i--) {
					var text = theData[i].lines;
					thetext = text.concat(thetext);
				}
				callback();

			});
		}],
	function(err) {
	        if (err) return next(err);

	        for (var y = 0; y < thetext.length; y++){
	        	var rez = rita.RiTa.tokenize(thetext[y]);
	        	if (rez[(rez.length)-1] == ',' || rez[(rez.length)-1] == '.' || res[(res.length)-1] == ';' || res[(res.length)-1] == '--' || res[(res.length)-1] == ':'){
	        		rez.splice(rez[(rez.length)-1],1);
	        	}
				if (rez[(rez.length)-1] == ',' || rez[(rez.length)-1] == '.' || res[(res.length)-1] == ';' || res[(res.length)-1] == '--' || res[(res.length)-1] == ':'){
	        		rez.splice(rez[(rez.length)-1],1);
	        	}
				var POSp = rita.RiTa.getPosTags(rez[(rez.length)-1]);
				if(POSp =='nn'||POSp =='nns'||POSp =='nnp'){
					ttext.push(rez);
				}
			}
			_.shuffle(ttext);
			var base = [0,1,2,3,4,5,5,0,4,1,3,2,2,5,3,0,1,4,4,2,1,5,0,3,3,4,0,2,5,1,1,3,5,4,2,0,1,3,5];
		if (ttext.length > 39){
			for (var i = 0; i < 39; i++) {

				var liyne = ttext[i];
				var len = liyne.length;
				liyne[len-1]=wordy[base[i]];

				if (i == 36){
					for (var t = 0; t < (liyne.length)-1; t++) {
						POSp = rita.RiTa.getPosTags(liyne[t]);
						if (POSp =='nn'||POSp =='nns'||POSp =='nnp'){
							liyne[t]=wordy[0];
							break;
						}
					}
				}
				if (i == 37){
					for (var t = 0; t < (liyne.length)-1; t++) {
						POSp = rita.RiTa.getPosTags(liyne[t]);
						if (POSp =='nn'||POSp =='nns'||POSp =='nnp'){
							liyne[t]=wordy[2];
							break;
						}
					}
				}
				if (i == 39){
					for (var t = 0; t < (liyne.length)-1; t++) {
						POSp = rita.RiTa.getPosTags(liyne[t]);
						if (POSp =='nn'||POSp =='nns'||POSp =='nnp'){
							liyne[t]=wordy[4];
							break;
						}
					}
				}

				sestina.push(rita.RiTa.untokenize(liyne));
			}
			sestina.splice(6,0,' ');
			sestina.splice(13,0,' ');
			sestina.splice(20,0,' ');
			sestina.splice(27,0,' ');
			sestina.splice(34,0,' ');
			sestina.splice(41,0,' ');
		}else{
			sestina='try again';
		}

	res.json(sestina);
	console.log('sestina sent');
		   
	});
});


/*
Macaronic: 
1. mix different languages: textbook + people talking + newspaper + thoughts about love 
2. Each line becomes a line of the poem
*/

/*
Pantoum:
1. stanzas of four lines each repeated in pattern
2. Generate content first to create nine lines 
L1
L2
L3
L4
====
L2
L5
L4
L7
====
L5
L8
L7
L9
*/

/*
Ghazal 
1. Two long lines and a break. Often mystical. Headlines? 
2. 4 stanzas.
*/

/*Event Poem
1. choose two objects 
2. wiki how of one object 
3. replace object
*/

app.get("*", function(req,res){
	res.redirect("/");
});