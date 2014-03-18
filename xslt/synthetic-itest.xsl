<xsl:stylesheet version = '1.0'
     xmlns:xsl='http://www.w3.org/1999/XSL/Transform'>

<xsl:output method="xml" indent="yes"/>

<xsl:template match="//*[@type='WmqQueueConnectionFactory']">
  <itest>
    <deployeds>
      <xsl:element name="{@type}">
        <xsl:for-each select="property[not(@hidden)]">
            <xsl:element name="{@name}">
              <xsl:if test="@default"><xsl:value-of select="@default"/></xsl:if>
              <xsl:if test="not(@default)">SAMPLE</xsl:if>
            </xsl:element>
        </xsl:for-each>
      </xsl:element>
    </deployeds>
  </itest>
</xsl:template>

</xsl:stylesheet> 