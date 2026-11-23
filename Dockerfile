FROM quay.io/wildfly/wildfly:latest-jdk17

COPY postgresql-42.7.2.jar /tmp/
COPY build/libs/*.war /tmp/
COPY configure-db.cli $JBOSS_HOME/configure-db.cli
COPY eclipselink-3.0.4.jar $JBOSS_HOME/modules/system/layers/base/org/eclipse/persistence/main/
COPY module.xml $JBOSS_HOME/modules/system/layers/base/org/eclipse/persistence/main/

RUN cp /tmp/postgresql-42.7.2.jar $JBOSS_HOME/standalone/deployments/

RUN $JBOSS_HOME/bin/jboss-cli.sh --file=$JBOSS_HOME/configure-db.cli

RUN cp /tmp/*.war $JBOSS_HOME/standalone/deployments/app.war

EXPOSE 8080 9990

CMD ["sh", "-c", "$JBOSS_HOME/bin/standalone.sh -b 0.0.0.0 -bmanagement 0.0.0.0"]