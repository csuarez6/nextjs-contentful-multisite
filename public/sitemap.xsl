<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
                xmlns:html="https://www.w3.org/TR/REC-html40"
                xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
                xmlns:sitemap="https://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="https://www.w3.org/1999/XSL/Transform">
    <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
    <xsl:template match="/">
        <html xmlns="https://www.w3.org/1999/xhtml">
            <head>
                <title>XML Sitemap | Aplyca</title>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                <style type="text/css">
                    body {
                        font-family: sans-serif;
                        font-size: 16px;
                        color: #242628;
                    }
                    a {
                        color: #000;
                    }
                    table {
                        border: none;
                        border-collapse: collapse;
                        width: 100%
                    }
                    th {
                        text-align: left;
                        padding-right: 30px;
                        font-size: 11px;
                    }
                    thead th {
                        border-bottom: 1px solid #7d878a;
                        cursor: pointer;
                    }
                    td {
                        font-size:11px;
                        padding: 5px;
                    }
                    tr:nth-child(odd) td {
                        background-color: rgba(0,0,0,0.04);
                    }
                    tr:hover td {
                        background-color: #B4BCFD;
                    }

                    #content {
                        margin: 0 auto;
                        padding: 2% 5%;
                        max-width: 800px;
                    }

                    .desc {
                        margin: 18px 3px;
                        line-height: 1.2em;
                    }
                </style>
            </head>
            <body>
                <div id="content">
                    <h1>XML Sitemap<xsl:if test="count(sitemap:sitemapindex/sitemap:sitemap) &gt; 0"> Index</xsl:if></h1>
                    <p class="desc">
                        <xsl:if test="count(sitemap:sitemapindex/sitemap:sitemap) &gt; 0">
                            <a href="https://www.sitemaps.org/protocol.html#index" target="_blank">Sitemap indexes</a> provide a list of URLs to sitemaps for search engines to crawl.
                        </xsl:if>
                        <xsl:if test="count(sitemap:sitemapindex/sitemap:sitemap) &lt; 1">
                            <a href="https://www.sitemaps.org/protocol.html" target="_blank">Sitemaps</a> provide a list of URLs for search engines to crawl.
                        </xsl:if>
                    </p>
                    <p class="desc">
                        This is a human-readable version of the sitemap; to see the actual sitemap, choose <b>View Source</b>.
                    </p>
                    <xsl:if test="count(sitemap:sitemapindex/sitemap:sitemap) &gt; 0">
                        <table id="sitemap" cellpadding="3">
                            <thead>
                                <tr>
                                    <th width="75%">Sitemaps (<xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)"/> total)</th>
                                    <th width="25%">Last Modified</th>
                                </tr>
                            </thead>
                            <tbody>
                                <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
                                    <xsl:variable name="sitemapURL">
                                        <xsl:value-of select="sitemap:loc"/>
                                    </xsl:variable>
                                    <tr>
                                        <td>
                                            <a href="{$sitemapURL}"><xsl:value-of select="sitemap:loc"/></a>
                                        </td>
                                        <td>
                                            <xsl:value-of select="concat(substring(sitemap:lastmod,0,11),concat(' ', substring(sitemap:lastmod,12,5)))"/>
                                        </td>
                                    </tr>
                                </xsl:for-each>
                            </tbody>
                        </table>
                    </xsl:if>
                    <xsl:if test="count(sitemap:sitemapindex/sitemap:sitemap) &lt; 1">
                        <!-- <p class="desc"><a href="/sitemap.xml" class="back-link">&#8592; Back to index</a></p> -->
                        <table id="sitemap" cellpadding="3">
                            <thead>
                                <tr>
                                    <th width="70%">URLs (<xsl:value-of select="count(sitemap:urlset/sitemap:url)"/> total)</th>
                                    <!-- <th width="15%">Images</th> -->
                                    <th title="Last Modification Time" width="15%">Last Modified</th>
                                </tr>
                            </thead>
                            <tbody>
                                <xsl:variable name="lower" select="'abcdefghijklmnopqrstuvwxyz'"/>
                                <xsl:variable name="upper" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZ'"/>
                                <xsl:for-each select="sitemap:urlset/sitemap:url">
                                    <tr>
                                        <td>
                                            <xsl:variable name="itemURL">
                                                <xsl:value-of select="sitemap:loc"/>
                                            </xsl:variable>
                                            <a href="{$itemURL}">
                                                <xsl:value-of select="sitemap:loc"/>
                                            </a>
                                        </td>
                                        <!-- <td>
                                            <xsl:value-of select="count(image:image)"/>
                                        </td> -->
                                        <td>
                                            <xsl:value-of select="concat(substring(sitemap:lastmod,0,11),concat(' ', substring(sitemap:lastmod,12,5)))"/>
                                        </td>
                                    </tr>
                                </xsl:for-each>
                            </tbody>
                        </table>
                        <!-- <p class="desc"><a href="/sitemap.xml" class="back-link">&#8592; Back to index</a></p> -->
                    </xsl:if>
                    <footer>
                        <p class="desc">
                        </p>
                    </footer>
                </div>
            </body>
        </html>

    </xsl:template>
</xsl:stylesheet>