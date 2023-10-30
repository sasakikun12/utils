import config
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib

def sendEmail(props, email):
    
    message = MIMEMultipart("alternative")
    message["Subject"] = f"Subject"
    message["From"] = config.sender_email

    if type(email) == str:
        message["To"] = ", ".join(config.receiver_email) + f', {email}'
    else:
        message["To"] = ", ".join(config.receiver_email + email)

    destinatario = message["To"].split(",")

    html = props
    part = MIMEText(html, "html")
    message.attach(part)

    mailserver = smtplib.SMTP(config.smtp_email, config.smtp_port)
    mailserver.ehlo()
    mailserver.starttls()
    mailserver.login(config.usuario, config.senha)
    mailserver.sendmail(config.sender_email, destinatario, message.as_string())
    
    print ("Email Enviado com Sucesso!")


def send_file():

    variavel = "variavel"
    
    sendEmail("""\
                <html>
                    <body>
                        <div>
                            Text {variavel}
                        </div>
                    </body>
                </html>
                """.format(variavel = variavel))
    

if(__name__ == "__main__"):
    send_file()