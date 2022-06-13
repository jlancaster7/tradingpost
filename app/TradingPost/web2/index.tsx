import ReactDOM from 'react-dom';


function blah(ek: string) {
  alert("OK");
}
blah("HI");

const Welcome = () => {
  return <h1>Welcome</h1>;
};
export type WelcomeScreenProps = { title: string }
function ok(lol: string) {

}
const mountingNode = document.querySelector("#root");

ReactDOM.render(<Welcome />, mountingNode);