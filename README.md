# coin-market

This is a simple dockerized worker in NodeJS
which gets coins market infos from https://api.alternative.me every 5 minutes
and put it on Elasticsearch.

## Environment variables

`ELASTICSEARCH_URL` (e.g.: http://elasticsearch:9200)
