# zipkin-axios-example

Example to demonstrate distributed-tracing using **express** and **zipkin**.

## Usage

### 1. Setup zipkin collector
The **easiest way** to get started is to spawn a **docker image**
using **docker-swarm** as described [here](https://github.com/openzipkin/docker-zipkin).

### 2. Run example
1. Clone this repository
2. cd zipkin-axios-example && npm install
3. node frontend.js
4. node back1.js
5. node back2.js
6. curl http://localhost:3000/sequence  

### Note
You should set the correct **ZIPKIN_URL** in the sources or using env-vars described below.

Example:
```bash
ZIPKIN_URL=http://some-zipkin.com:9411 node frontend.js
```

## ENV
Set the following env vars to configure frontend back1 or back2.

**PORT**:int -> Port for express server

**ZIPKIN_URL**:String URL of zipkin server including port

**SERVICE_NAME**:String name of the service for the tracer



## Sequencial request
### Flow

```
+-------+                            +-----------+                           +-------+ +-------+
| curl  |                            | frontend  |                           | back1 | | back2 |
+-------+                            +-----------+                           +-------+ +-------+
    |                                      |                                     |         |
    | http://localhost:3000/sequence       |                                     |         |
    |------------------------------------->|                                     |         |
    |                                      |                                     |         |
    |                                      | http://localhost:3001/firstname     |         |
    |                                      |------------------------------------>|         |
    |                                      |                                     |         |
    |                                      |                                John |         |
    |                                      |<------------------------------------|         |
    |                                      |                                     |         |
    |                                      | http://localhost:3002/lastname      |         |
    |                                      |---------------------------------------------->|
    |                                      |                                     |         |
    |                                      |                                     |     Doe |
    |                                      |<----------------------------------------------|
    |                                      |                                     |         |
    |                       Hello John Doe |                                     |         |
    |<-------------------------------------|                                     |         |
    |                                      |                                     |         |

```
### Result
![](docs/sequ.png)

## Chained request
### Flow

```
+-------+                         +-----------+                          +-------+                            +-------+
| curl  |                         | frontend  |                          | back1 |                            | back2 |
+-------+                         +-----------+                          +-------+                            +-------+
    |                                   |                                    |                                    |
    | http://localhost:3000/chain       |                                    |                                    |
    |---------------------------------->|                                    |                                    |
    |                                   |                                    |                                    |
    |                                   | http://localhost:3001/fullname     |                                    |
    |                                   |----------------------------------->|                                    |
    |                                   |                                    |                                    |
    |                                   |                                    | http://localhost:3002/lastname     |
    |                                   |                                    |----------------------------------->|
    |                                   |                                    |                                    |
    |                                   |                                    |                                Doe |
    |                                   |                                    |<-----------------------------------|
    |                                   |            ----------------------\ |                                    |
    |                                   |            | Add firstname: John |-|                                    |
    |                                   |            |---------------------| |                                    |
    |                                   |                                    |                                    |
    |                                   |                           John Doe |                                    |
    |                                   |<-----------------------------------|                                    |
    |                                   |                                    |                                    |
    |                    Hello John Doe |                                    |                                    |
    |<----------------------------------|                                    |                                    |
    |                                   |                                    |                                    |
```

### Result
![](docs/chain.png)

#### Notes
Sequence diagrams are created using [textart.io](http://textart.io/sequence).
