import app from './app'

const port = process.env.PORT ? parseInt(process.env.PORT) : 4000;

app.listen(port, function () {
    console.log(`Express Server initiated listening on port ${port}`);
})