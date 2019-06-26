const express = require('express');
const app = express();
const port = 4201;

app.use(express.json({
  "type": "*/*"
}));

// @ts-ignore
const movies = require('./imdb-5000-movies.json');

app.get('/', (req, res) => res.send('Hello World!'));
app.get('/api', (req, res) => res.send('Hello API World!'));

app.post('/api/movies', (req, res) => {
  const pageSize = req.query.pageSize || 20;
  const page = (req.query.page || 1);
  const body = req.body || {};

  let response = movies;

  // apply filtering
  if (body.filters && body.filters.length) {
    body.filters.forEach((filter) => {
      const matchOn = (filter.value && filter.value.id) ? 
        filter.value.id : filter.value.replace(/%/g, '.*')
      const pattern = new RegExp(matchOn, 'i');
      response = response.filter((value) => {
        let include = false;
        filter.fields.forEach((field) => {
          const str = ('' + value[field]);
          if (str.match(pattern)) include = true;
        });
        return include;
      });
    });
  }

  const filtered = response;

  // apply sorting
  const sortField = body.sort ? body.sort.path : null;
  const sortAsc = body.sort ? body.sort.ascending : true;
  if (sortField) {
    response.sort((a, b) => {
      const aval = a[sortField];
      const bval = b[sortField];
      let res = 0;
      if (typeof aval === 'string') {
        res = aval.localeCompare(bval)
      } else {
        res = (aval > bval) ? 1 : ((aval < bval) ? -1 : 0)
      }
      return sortAsc ? res : -res;
    });
  }

  // apply pagination
  response = response.slice((page - 1) * pageSize, page * pageSize);

  res.send({
    _embedded: {
      resourceList: response
    },
    _page: {
      size: pageSize,
      totalElements: filtered.length,
      totalPages: Math.floor(filtered.length / pageSize),
      number: page,
    },
  });
});

app.get('/api/movies/config', (req, res) => {
  // see src\lib\smart-table\smart-table.types.ts - SmartTableConfig
  res.send({
    url: "/api/movies",
    baseFilters: [],
    columns: [{
      "label": "Titel",
      "key": "movie_title",
      "type": "text",
      "sortPath": "movie_title"
    },{
      "label": "Jaar",
      "key": "title_year",
      "type": "number",
      "sortPath": "title_year"
    },{
      "label": "Regisseur",
      "key": "director_name",
      "type": "text",
      "sortPath": "director_name" 
    }],
    filters: [{
      "id": "smartfilter",
      "display": "generic",
      "type": "input",
      "label": "Zoek een film",
      "placeholder": "Zoek op titel, jaar, ...",
      "fields": ["movie_title", "director_name", "title_year"]
    },{
      "id": "title",
      "display": "optional",
      "type": "input",
      "label": "Titel",
      "field": "movie_title"
    },{
      "id": "director",
      "display": "optional",
      "type": "input",
      "label": "Regisseur",
      "field": "director_name"
    },{
      "id": "genre",
      "display": "optional",
      "type": "select",
      "options": "Action|Animation|Adventure|Comedy|Family|Fantasy|Musical|Romance|Sci-Fi|Thriller".split('|').map((v) => ({ id: v, label: v })),
      "label": "Genre",
      "field": "genres"
    }],
    options: {
      defaultSortOrder: {
        key: 'movie_title',
        order: 'asc'
      },
      loadDataMessage: 'De films worden geladen...',
      noDataMessage: 'Er zijn geen films die voldoen aan de criteria',
      pageSize: 20,
      pageSizeOptions: [10, 20, 50],
      resetSortOrderOnFilter: true
    }
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
