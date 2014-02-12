# Nitro Analytics Server

This is just a simple server that is run on Heroku to track how Nitro is used.

It listens to messages sent via Redis pub-sub and then emits event to Google Analytics.

Messages are published in the following formats:

    <user-id?>|<category>.<action>

    32|task.create
    43|socket.login

    socket.connect
