var express = require("express")
var path = require("path")
var formidable = require("formidable")
var hbs = require("express-handlebars")
var app = express()
app.use(express.static('static'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
var PORT = process.env.PORT || 3000;

let tabPliki = [];
let aktID = 0;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs({
    extname: '.hbs',
    defaultLayout: 'main.hbs',
    partialsDir: 'views/partial',
}));

app.get('/', (req, res) => {
    res.redirect('/filemanager');
});

app.get('/filemanager', (req, res) => {
    res.render('filemanager.hbs', { 'pliki': tabPliki });

});

app.get('/upload', (req, res) => {
    res.render('upload.hbs');
});

app.get('/info', (req, res) => {
    let context = {
        plInfoID: tabPliki.find(plik => plik.id == req.query.id)
    }
    res.render('info.hbs', context);
});

app.get('/reset', (req, res) => {
    tabPliki = [];
    res.redirect('/filemanager');
});

app.post('/upload', (req, res) => {
    let form = new formidable.IncomingForm({
        keepExtensions: true,
        multiples: true,
        uploadDir: __dirname + '/static/uploads/'
    });
    form.parse(req, (err, fields, pliki) => {
        let listaPlikow = pliki['pliki'];
        if (err) {
            return res.status(400).json({
                error: err,
                status: "fail",
                message: "problem parsing pliki",
            })
        }
        if (Array.isArray(listaPlikow)) {
            for (let i = 0; i < listaPlikow.length; i++) {
                listaPlikow[i]['id'] = aktID++;
                listaPlikow[i]['name'] = listaPlikow[i].name;
                listaPlikow[i]['type'] = listaPlikow[i].type;
                listaPlikow[i]['size'] = listaPlikow[i].size;
                listaPlikow[i]['path'] = listaPlikow[i].path;
                listaPlikow[i]['saveDate'] = listaPlikow[i].lastModifiedDate.getTime();
                wstawIkone(listaPlikow[i]);
                tabPliki.push(listaPlikow[i]);
            }
        } else {
            listaPlikow['id'] = aktID++;
            listaPlikow['name'] = listaPlikow.name;
            listaPlikow['type'] = listaPlikow.type;
            listaPlikow['size'] = listaPlikow.size;
            listaPlikow['path'] = listaPlikow.path;
            listaPlikow['saveDate'] = listaPlikow.lastModifiedDate.getTime();
            wstawIkone(listaPlikow);
            tabPliki.push(listaPlikow);
        }
        res.redirect('/filemanager');
    });
});
app.get("/download", function (req, res) {
    let plik = tabPliki.find(plik => plik.id == req.query.id);
    res.download(plik.path);
});

app.get("/delete", function (req, res) {
    tabPliki = tabPliki.filter(plik => !(plik.id == req.query.id));
    res.redirect("/filemanager");
})

app.listen(PORT, () => {
    console.log('Start serwera na porcie ' + PORT);
});

function typPliku(nazwa) {
    let rozsz = nazwa.split('.');
    return rozsz[rozsz.length - 1];
}

function wstawIkone(plik) {
    let typ = typPliku(plik.name);
    if (['jpg', 'js', 'html', 'zip', 'png', 'txt', 'pdf'].includes(typ)) {
        plik['ikonka'] = `gfx/${typPliku(plik.name)}icon.png`;
    } else {
        plik['ikonka'] = `gfx/no.png`;
    }
}