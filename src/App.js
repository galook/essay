import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import Typed from 'react-typed'
import Fade from 'react-reveal/Fade';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import ProgressBar from 'react-bootstrap/ProgressBar';
import axios from 'axios';
import Timer from 'react-compound-timer'


import './style.css'
import 'bootstrap/dist/css/bootstrap.min.css';

// GLOBAL VARIABLES
var debug = false;
var questions = [
  "Otázky se nepodařilo našíst ze serveru. Kontaktujte prosím podporu na holubec@gchd.cz"
]
var responses = []
var userId;
var sent = false




class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loginVisible: true,
      showForm: false
    }
  }
  continuetoApp = () => {
    axios
      .post('https://quvia.cz:3000/', { type: "getQuestions" }) // získá otázky ze serveru
      .then((response) => {
        console.log(response.data.questions);
        if (response.data.questions) {
          questions = response.data.questions;
        }
        let userId = document.getElementById('user').value
        if (!userId || userId === "" || userId.length < 5) { document.getElementById('user').value = ""; return alert("Neplatné User ID, zadejte ho znovu."); }
        this.setState(() => {
          return {
            loginVisible: false
          }
        })
        // fade animace
        setTimeout(() => {
          renderApp()
        }, 700);
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  typingComplete = () => {
    setTimeout(() => {
      this.setState(() => {
        return {
          showForm: true
        }
      })
    }, 500);

  }
  render() {
    return (
      <div >
        <div className={this.state.loginVisible ? "fadeIn" : "fadeOut"}>
          <h1 >

          <Typed
              strings={["Quvia Essay",
                "Quvia Esej", "Quvia Essai",
                "Quvia Essay. Vítej"]}
              typeSpeed={170} //170
              backDelay={500} //500
              backSpeed={120} //120
              onComplete={this.typingComplete}

            ></Typed>
          </h1>
          {
          this.state.showForm && <Fade center>
            <Form.Group className="bodyDiv">
              <Form.Label>Vaše Identifikace</Form.Label>
              <Form.Control type="text" id="user" style={{ width: '60%', margin: 'auto' }} rows="1" placeholder="Zadejte Vaše P číslo" />
              <Form.Text className="text-muted">
                Nevíte si rady? Napište na <a href="mailto:holubec@gchd.cz">holubec@gchd.cz</a> , odpovídáme ihned.
              </Form.Text>
            </Form.Group>
            <Button style={{ marginTop: '5%' }} onClick={this.continuetoApp} variant="primary">Pokračovat do Aplikace</Button>
          </Fade>
          }
        
        </div>
      </div>

    );
  }
}
function Header() {
  return (
    <div className="Title">
      <header>
        <h1>Quvia Essay.</h1>
      </header>
    </div>

  )

}
class Question extends React.Component {
  constructor(props) {
    super(props);
    this.nextQuestion = this.nextQuestion.bind(this)
    this.state = {
      questionNum: 0,
      foo: "bar",
      timePerQuestion: 30000,
      timerVisible: true,
    }
    setTimeout(() => {
      this.nextQuestion()
    }, this.state.timePerQuestion);
  }
  nextQuestion() {
    this.setState(() => {
      return {
        timerVisible: false, // pro reset časovače

      }
    })

    let odpoved = document.getElementById("odpoved")
    responses.push({
      questionNum: this.state.questionNum,
      question: questions[this.state.questionNum],
      response: odpoved.value
    });

    localStorage.setItem("responses", responses);

    if (this.state.questionNum + 1 >= questions.length) {

      if (!sent) {
        sent = true;
        console.log("sending...");

        axios
          .post("https://quvia.cz:3000", {
            type: "setResponses",
            user: userId,
            responses: [responses.map((r) => {
              return r.response;
            })]
          })
          .then((response) => {
            console.log(response);

          })
          .catch((err) => {
            console.log(err);
            alert("Chyba pri odesilani");


          })
      } else if (sent) {
        console.log("Nemohu odeslat, již odesláno");
      }
      renderConclusion()

    } else {
      this.setState((prevState) => {
        return {
          timerVisible: true,
          questionNum: ++prevState.questionNum
        }
      })
      odpoved.value = ""
      console.log(this.state);
      setTimeout(() => {
        this.nextQuestion()
      }, this.state.timePerQuestion);


    }

  }
  render() {
    return (
      <div>
        <center><h3> Odpovězte na následující otázku: </h3></center>
        <div className="bodyDiv">
          <ProgressBar className="ProgressBar" now={((this.state.questionNum + 1) / questions.length) * 100} label={(this.state.questionNum + 1) + "/" + questions.length} />

          <Form>
            <Form.Group>
              <Form.Label><h4>{questions[this.state.questionNum]}</h4></Form.Label>
              <Form.Control as="textarea" rows="15" id="odpoved" placeholder="Zadejte vaší odpověď..." />
              <Form.Text className="text-muted">
                Odpověď je průběžně ukládána.
              </Form.Text>
            </Form.Group>

            {this.state.timerVisible && <Timer
              initialTime={this.state.timePerQuestion}
              direction="backward"
              id="timr"
            >
              <h3 className="timr"><Timer.Minutes className="timr" /></h3> <h5 className="timr"> min</h5> <span></span>
              <h3 className="timr">< Timer.Seconds /></h3> <h5 className="timr">sec </h5> <br /> zbývá do další otázky
            </Timer>
            }
          </Form>
        </div>
      </div>
    )
  }
}
class App extends React.Component {

  render() {
    return (
      <div>
        <Fade center>
          <Header />
          <Fade center>
            <Question />
          </Fade>
        </Fade>
      </div>
    )
  }
}
class Conclusion extends React.Component {
  render() {
    return (
      <center>

        <Fade center>
          <Header />
          <h3>Vaše odpovědi byly zaznamenány a odeslány k hodnocení.</h3>
          <h5>Děkujeme za spolupráci. Odeslané odpovědi si můžete prohlédnout níže: </h5> <br />
          <div className="bodyDiv">
            {
              responses.map((response) => {
                return (<div key={response.questionNum}> <p > <b>{questions[response.questionNum]}</b> <br /> {response.response}</p><br /><br /></div>);
              })
            }
          </div>
        </Fade>
      </center>
    )
  }
}

const renderApp = () => {
  ReactDOM.render(
    <App />,
    document.getElementById('root')
  )
}
const renderConclusion = () => {
  ReactDOM.render(
    <Conclusion />,
    document.getElementById('root')
  )
}
Login = debug ? App : Login
export default Login;
