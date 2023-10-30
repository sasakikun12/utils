import React, { Fragment } from "react";
import ReactToPrint from "react-to-print";
import { verificaPeriodo, adjustTable } from "../utils/Data";

class PdfComponent extends React.Component {

  render() {

    return (
      <div>
        <ReactToPrint
          content={() => this.componentRef}
          trigger={() => <button className="btn btn-danger">PDF</button>}
        />
        <div className="d-none">
          <div ref={(response) => (this.componentRef = response)}>
            {this.props.respostas.map((value, index) => (
              <Fragment key={index}>
                <div className="justify-content-center w-100">
                  <h1 className="mt-5 text-center">{value.periodo}</h1>
                </div>
                <div className="d-flex container">
                  <div className="justify-content-center w-50">
                    <h2 className="my-5 text-center">{this.props.nome}</h2>
                  </div>
                  {
                    <div className="justify-content-center w-50">
                      <h2 className="my-5 text-center">
                        {
                          this.props.respostas.filter(
                            (obj) =>
                              obj.periodo === value.periodo &&
                              obj.nome === value.nome
                          )[0].gestor
                        }
                      </h2>
                    </div>
                  }
                </div>
                <table className="table table-striped mx-auto">
                  <thead>
                    <tr>
                      <td className="text-center">Colaborador</td>
                      <td className="text-center">Gestor</td>
                    </tr>
                  </thead>
                  {Object.keys(verificaPeriodo(value.periodo))
                    ?.map(Number)
                    ?.sort((a, b) => a - b)
                    ?.map((obj) =>
                      adjustTable(
                        obj,
                        this.props.respostas.filter(
                          (obj) => obj.periodo === value.periodo
                        ),
                        verificaPeriodo(value.periodo)
                      )
                    )}
                </table>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default PdfComponent;
