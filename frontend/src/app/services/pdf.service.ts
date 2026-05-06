import { Injectable } from '@angular/core';
import { CollectionService } from './collection.service';
import { TEAMS, FWC_STICKERS, COCA_STICKERS } from '../models/album-data';
import jsPDF from 'jspdf';

const LOGO_B64 = 'iVBORw0KGgoAAAANSUhEUgAAANwAAABbCAIAAACXjXy2AAA4e0lEQVR42u29ebhVxZX3/11Vtc987ghcZlFQHMA4GxFFEyecFZVJE83Ydid2d9Jvp/vXQ5Ie8ubtTrqTNiYmMabFAZzn2SSKszggGBEFZLxw4c5n3rtqrd8f+5w7wLlwEVCI1MNzHj13331rV332mmrVKhIR7MtNRIhooB8FQeCcc46ZnYgws4gYY2wQRGNRv1TSWnd1dQpzMpUq5PNEFI/FtDFaaxHJ5/POOc/zYrEYAGa21hYKBaWU53mlUklpnU7X+L4fiUSYGUThcBKRUkorZTzPGKOU2tnOf5ob7etQ9uXPWhtiB0ihULA2YOu8iGeMNtoYz9PaaOMpbUiR2r0dAARgJ+wCZ60NfGuDIAgcMxEppePxBItorZVSnjHG87bCcT+g+xiU206Yc85aG35muruJoIiM0dFo1ItETSSqtR5ohsUWEOTEz4qfQSknfgZ+VoICBXmyBXK+uBLYQrjCGwACAGWgPJgodJwjcTIJiiQRTVMkJdEURdIUSZFJlC/eClmBXyzYwC+VioG1QWCjsVg8nlBKR6MRY8x+QPcBKLedmFAWlkqlbCajNcWiUS8S8byIicS02moKmQttkm3hTLPKbJDMJspulOwmKrRKsZOKXeTnxBbIFeF8MIgrsi4ESgDBVuNCgFQ+AQiBACiIAjREx8mLSSSFaD3idZIYSqkRUjMSNaMpPVbVjESqiSI1fW9oWWypUCzkSn4QBDaeSCSTSa2N53mfckD3Oii3mgPnXKFQyGYz7NholUjEI9GYjsT6ikH2M9K1Fh2rpP19aVtBXR+iewNyLarYJdZXrsJcVaXb9z8JIAiBFKAgBCgNUiAiUhDphVOYytiG/Ib/QhXe5xNgBdFAJCKJIZQeJfUHofFQDDkUQw/T9eMoUlt+BCAolQK/mM/lrWMvEkmlUpFIRGv9KaRzL5WUvu/ncjnfLxkdWmDRWDLZYwVKqVNal3PLEmx6G63vUMeHlGshvwTb81SVK8NJVGAD0hF4SYmmEEki1oh4HRJDEaujeCMiSZi4RBJMGs6HK8EWUeyEK6LQjVIbShnxc1LKwO8yhU5V6qaycsc28hRAKEXLMpeEIQ4OYMCV6eeIolQTDz0MI47HmJPUiGNUzZjyewiU8jnrl0p+wCKeVwb000PnJw9l3yEulUrd3d3MLup52uhEqrZHL7vMetn4Bta/gvWvqdblyDUjENVfBIqGGOJ4HeINlBqJ9EhJj6TaMUiPkppRKjUSyaHwUn00aFaym5FpRmYdd6+jrg3IblL5LVLoJr+b/Jy4AtkixIEtmPvivg2HBFCfz4r8FelnlYYXQMAOTuDADChIMi1DD5XRJ9HYaWr08SpdBjRwXMh0BUFgnVPapFKpeDz+J0/nJwllz5gyczabLeTzgMRisWRtnSECIEGWm9+QD3+P1X+gze+ofAfZfjSwAeJ1qBkjjQfLkEOl8RBqmKDSoygxhLwU9/E4BEB+s7R/IFveRet7aF1GnWso20yFTviABblevkWVjUUKla8CtBbtERkoAyKQBgTiICFeFuyDmRjCAINC81OV/5ECSKPs8feQSgAJEYHhHCxgIRqSquGmz2Dc5+jAz6mRx5GXCPV7PtNdKhaV1o4lHo8nk8n9knJPqel8Ph/4JaNVqrbeMwaAK3bI6mex/GG15jl0rIKF6pE7ChJPuvoDqWkSRhxHTUdS46GUGgFl+voi4bWuazW2vCsb36KWJWhdprrWSqFb+SBbuUwDBhIhjtUi3ojkMEkOo0STJIdycoiON1KsniNpisTJJOHFoAwpDyBRRgASCxGwhfVh8xzkyM+i2CG5VuQ2UfdGzqxXmWbkWlS+Db6Fq2h1DeiKwdrLqAIRhMFOAsBBPEjjgTJmKiacRweeolMjQzoL2Uwm0228iNYmHo+HMdT9UO4eHDOZTOD7qVQila4FwGLd6t/T0ruw8hnVuUY5iCp7wZJIyZCJGDsFo0+m4UerhgNBHm3jrgiXuP1DaV5E617CpsWq/X3KtpMPYQhAGuKBE2mkRqBuHBrGo34C1R8otaMp0UTxRuXtftkjECm0S65FutZSxwppXS6ty1THaspsQLEIByKQCQWqAVGvECWCOFhGACZIbaOMniITL9Tjz1K1Y0M6c92d+XxeaS8ajSaTyb5e0X4od64557q6uoqFfG1tTTJVA8BlNvCS22jpfGp5W1mAAAYMuHYMj52qJnweY06lhgnUo43FkUgoHQXgTDOvf5lWP4v1L1PrcspnyQIMKCACSdZzw3gMm0zDJmHYZNSPV+kRMPFtYz0h132swH4uS38TsqoPL5WPyjcUam708dshAGwB3eu5/X1sels2Llabl1Dnh1TwiQENeP0BJQURYYsALKB0DY89lQ+71Bxyrko0AQiszXZ15PKFdE1NLBaPRqP7ody5lslkstlsOhlL1dQDsG3L8drP6Z35qnsLESBwCmg4gMefrQ65EGOnqFh9D4lwPkiJ8sqRmNZ3sfIZrHxSml9Xmc3Kr+j3KKR2tAz/jIz8rBp1LIZOoppRhP6RTOFKbLzil5RdkD0hK/tEjvqQ2gMyuxI6P8SmxbLhVax/lba8g1xGOZAGDKBNaICX++ksfDDAdcMw/mxMmqXHn0EqAqBYyHd1dRGpVDqdSCT2XWfo44OSmVtbWzWhYchQIrJdq+XFH6m3b1X5blIQBieSMv4smjSHxp9J0dpymLqyskI6Up7Ctvd4+cPq/Yep+XXKFxCqZgNJD+GRx2DsNDpgKg2bTLF69NqXDBaC9PORP9GQQzm0CREQlO6NyQPSvQ4b35Q1z9GahbR5KeV9EMgDjAZU+BsAiQ3Kmn3E4Zg0iybN1g0TAASBn+3uyhWKtbV1qVQqJHLfQnOPQxkOR6FQ7OrqrK+ricYSzD6/9BO89GOd2VzGsXGsHHklPvMFapyoQl7YgcIpUyAlgBTbePmj9M4CWbtQ5XNhMIgjkMYJOOAUmTCdxpxM6ZHUTxFzGcHdvNC95xgFlOqzqARuew9rFmLlU1j3EnVu1A4I6QyVezh8gRMLTib5kAvo6C+p8WcoELPkMp3ZfCEWT9TW1AyUEfJphDIksquru1TKNzY2au25Da/hsW+oNYvIA1vIkINwwl/Q0V+kWCMBwo4gIA2wACANgDcvlcX/S+/eTe3rFEMEYiBDDsRBZ+HQS2jMySqSqvw5R2U1p7DvBvB6TAulewEttvPaF/D+I2rVM2j9kBzIAzxTlq5E4AAlsIIb+1kc/2fmiMvIJFmQ6+7IFYrRaKyurpZCA3evl5p7EMrw4be0brGBHTFiBAP82vX01Hd0UABg43Uy5a/UCX+pYnUUqunQ2Arng5QDZM1zeO1n9P6jqlgIo9YuXS8HnYHJs+igM1Skpjy07Cq22p9cJDkEtKIuAIifkXUvyrIHaMVj1LZOCRABtCmjKSy+E4YMP0SO/ao6+hoVaxQg09VhLWtjampq9n49vmclZSaTyedyTcOHM8Q9cZ1+4WcqotiyO+wiOuv/6caJZRzLIkGEA6gIALd2IZ7/D1rxqLZAuII8bKIceRVNnqXqxveySAgD0/iTbyIQBnpjDlLq5JXP4I8L1KqnqbsbGhSpBD4BBJYD8JCxfPyfmWO/ruINTqS7o63kB7FYvK6u7lMKZaFQ6O7ubmoa5iD8wNVm0a0UVVZF5awfmhOuAwDnk/bKSIkDaQFs6x/x7L+qd+8iK2V384ApOP5addglZJIAIJaEemyvT1+TctxV6XKAqWs1v3sfltyhmt9QriI4w8BCEEgAHnKAO/Ev9HFf05Fa51x76xbSJplM9l2x/FRAycxbWrcMaagjE3VPXKefv15FdRBvpMvnm3Gf69HRlaudKC2u4F74T3rpxybfDQ1m8IGn0pRvqYkXVUSjBWnsz4TtoZMZVLG8xcmHv5fFN6v3HqJcniKAMeX3Ngg4AA8/BFP/Vh99DUH5frGjvcN4kdra2q1SOfcZKIMgYGYiEki/UHMlihEG+lg44kVCR6+9vSMWMYlUOlh8s77nyxRRNjGUvvCEHnYUcQDl9XvvSdsNr8ij39Dr3lAGYsEjJmHaP9ARs8JsMjB/ikXjYOxOJ6qMoLQt57dvobfnqdYN5AGeV85V8gM4uHEnymn/7E04F0A+293VnU2l0+l0eh+Dsq2tzTkXj8cVePtXOse5fKG+oSEWi7W1bmkcMsR1r8ONR+t8pzMRufppPXoqsQ2torKdBAiRfe2n9OTfGVcUgYumMPVv1UnfUl6yB9n94A2OTgeU41+usAVv3yGv/4I2LVcG5Jmy1V6yjiCTZ9Jp3zdDJgLoaGstBbahoaFvdtxeDWWpVOrq6ho2bNhgtbZzHZ2dhUKhsaEulkjZx79hXrwBCu7cH+nPfrufjBQWUiKWH/1z9cqvVVRzybkJ0/S5/0PDjgRA7KD24/hRHXZlAHCQ4yW349Wfqg3vKgNEPAAijILjVI1M/Y466dvKRP1Sob2jKxqL1dfV7Q0xowGhrIQYu7SiVLqmtPY59eZvVKIBbKvdRiHwZdQx+uivgV13d3dtXb3LbpCfH2kyHcHYz5gvL6JyEJvKdwfEFfie2XrpQxQzbC2f9g902vc0mT7++P62a9566AzZPL99K176sdr0gYoAxgMAF3ARPPYYnPVDfdCZBGS6O/OFUl1dbTQaq0zRx44jEQCzQ39FhAB4TUe5IE9P3KqSGEiNO8Dl2/XJf1dbV8uAvPegzrQLgU64DsqAXcVHEUBEnLtnlln6MMW0UzGZ+Wt9+CwSgbhe/b6/7cL0lpM+2SmTUMd+nSfPca//Ql76L9XRQjEF7akkVPObbt5Z9oQ/V6f/S7qmMRYrdHVnMpnskCFDPkFhuQNJ2dHRoZSqra0NE2bt49/QL96gkvHq8hJwhUDO/lc15TukPTf/PLP0cW4cKte+oxNDez0idqK0feSr5uWbKKatV0tzHlBjT4EtkfZ6XfKyh059MiS5x2ba33ZSajoowwAyG9zzP1Cv/0oHFjGDcOmsYLlpAs7+kZl4EYCuznY/cMViURF9PNIy3PeklEqna9Lp9GChFGYiMCn32LXmhRsp6VXhkhSYrVL0V2spVs8/m2g2r7OTz6XZj+pwWQKAOCFt3/qNvucrKu4xReWLj+vRU+F86EiZxXBdpx98fTx+cf1cn8ru//3sDRJNAXj9S/L03+sVCxEFKQIZ+AEL3PFfUWf8Xx0fYq1fLPgfrwFFIAr8UqlUGrSiJAUwiTPn/sKRUc//TFXl0gqNmaxSI2TzOyrXIgCaJmuIiCNSEAdS3LVWPfU3KqpcEMis2/XoqeAAOsKdq8l4lBoVJhFKvkW6mmnEZwhKQMKBW/+Kqh2ja8f1MCrCVFl/298GodDD6WY1eopc81yw6Ab17PdNoQ3k4GkF4JWb+MNn7fT/Ngefn0p/7M64BEgm2traBm+9CUiFNp+afr2TAC/8cmsuieCAhkMAQraZAh8KlBwWjkcofYWIn/83k+0UwE39pjnsctiSmKh97ru08D+hozL9P83RX+HVf5C7r1SZ5mDiOWbmfcKW51+oVjzLiQa54g4z/ixIuN6tXXY9P/A1yreQ0gNspN3fqnnopFSsjowqp0MLA1AJj9pW8PwL7YijPyYzSQBFYHHWV+fdYMacXFdbY3b2bRMQiTPn3mgBeuGX/fU4QYDasQCk1BWmL1JPWEcYykjnSlp6Bymy9WP1af9K4mCi3LFCPfdvmkRKBfeH7/JR18jL/6k7mlGT1Eue4JNegFj97rPUkFKZdvvKT3j82cRM2uPcJrntPG/dEnhbK/n9rcr0U//NnwIylWSOnq+iES2CDW9+lDsPRiZsa5Q5sAPNuEGNnUqVTu2s5g83zjh97o2OtHr+5yppynk6YYvWAACZMOmK/bzq83bKsnt0PgcBPnuditaSC0Rr6IiYGIp5CiCxOkVK4kPFgoo5eKBEg4iIhspn2Qc1TgBASrvWP8pt55nmNUj0CQjsl5Xbp6e/e4EA8G3fN7m8D3Nn3+3QEY7oHdgPIvDdVr/IxpNZ8/QRs6TiLXyk4AsRhBQzTb/BAvT8zylhyvq0Zz9KtE40yEI6VpW/CdXBqmdIyNXU0OGXAQKlSVjVjA3Ov9E+9++IpnDOfykQn/59V8pQ6wo57moz/FgA9uKf4q3b3YgjzLTvKcA53y660aRGu6Mmwrk+b+u2nxj4R9T/Td//ux/hdwFhaE+CvF774kAOpyhFzrJSMv50KNWzOU4CRyd+RR8+S9j2KNWPGhEkBRLiQE+/wZqoXvjfKlq+IxU7AEh6uHgJE+Rp0+LQHQEp8bukdbmwyPCjVc3YHhebAO/Iq2TSTCiPQICY2nEy8z6BAzREiMiccB2fcF1Pd5X2vOnX79fVe40IZr77MjjAq2TE9qeFHCwbueQWPXkObRsPEkd9gtNml3QBaYhFoZNU5TUioGutAFQ7VtIjUFypNv9ROj6ghokAJLdFFdoBSOOhqif6U9YaLtz9VJbhIgQm0qislRM7TRWrnIhIU08sc3/7RB0msXm+81Lz7tOU0FWJBItjkstvMUfMod41lF4mqX96g9mF3hAL871zzBt3Uyo0KxU00LZcnE9eCiOOQ8sqyhf4vftpyt8BQLEL1gcBiUaw7e+5q3LhKBGI7Y0RgHovK1sIbicMx1AjsNutsZUwQ96Vg/m7K0qndDmUuDu7qssFDnb09gqpchGvHXegkswaeq5Bzt55qVn29PZC16zlilu9w2ehbzpOf+N2l6EUBsBs3b1zzVt3U6rSGxEYotYPpP0DGno4TThHFt8Jj/DWzXzCN5VJCByFCaomJsr09K/sunEA5e3GKHi4TkAgrtTP2H0SwhIZ2X3pSwJAHJH+CK7njubKQhkaRHyHxYE0DaoDQmFSdpC1Cy4x7z1DiYGIFMcGV9zmHX7FAERWaTu+aOs1UGGQYg7cPbPM4vsoGQEHvWOrNfIlrH4WQ4+gCee42qGm0KY2fiBLb8fRX1MmAW1gHD54jEmBLaCgteS7+OCzzLjPuTV/oFXPkeeV32yp5mP1WNnVa00RRKAUWWdNRJ9wnXgR98r1ys+IUmFi4QB37mPjb7vKFXqO2kiuSyZ8zjvoLF75uKxdBKMrsZDt/m7VPodfKw0buGjCnPCX7LLy2i+Ig0olgsE977Z/lwhKS76TD7/UG3WiW/c8rfg9jOnde47KGpgItEE+48aeaCZeJH4XL7qRnF/l74Y7T5xzyujjr9Wxegm63fxLzfLfDUwkW9Eyc7532Az0S6L9qFCGLMbj8Xw+v7XW5pK7e7Z5+35Ken2ILAe6SIGX3S3HX6uSw3nSTHn+Zyqq3bP/5g6fSelREqlRdou39mWseBkANCQLO+lEferf88rH6I7LTT4PtWuRHQIcHIFm3QzP43vnmEV3k9nVaJFoSA488Sh16t/a9+5WC2brktvVrirAwmqoK+8RV5I7LtbvPkveLndVgXOQ4842p3/Xrf4d3X6xzmard1WD83DjDjbHXQO/WxbM0H/8XfWxIgjDCdRlP1exeva7eMElevkftiMjLTzMut2bOANsB08kdphPKSJtbW2pVCoWi5VlpCu5e2aatx+kVAQuqLaWpZxlfOlZNXoqty/HL4/REkje2lP+Qp3zM/nNiWb1a4h5AKCNZAtu8iVq5n288im6/QItvkQixLxtWI168/xoBwafY0eezL5HjZ/O91yu37yHUtH+xVh6RAWJuG01u/SXZQSAtORL9rDpau5jWH4/zb9cKYEx1eSiEulXoZC2uTMBAiIisZZ1Ur74mBo9lX97ql7xPKWiYK4ma8PUCd7hQotoT7J5d/wXzUX/y2v+gFsv0C4HL1rFrFSeFPJu3Mnqysdhou62s83yZykZHcBZYSdGrrjNTLyU/S43/yLz/nPViVQKlh15PPMub+JFOyUjAVhr9fe+973tX5RMJltaWpKJuNKGXdHdNdMsfai/1u4zdszMjEDYCE28mBJDJN+CFa9QMiqrXsYhZyovSst+j6iGsGR8d+T56vK73PIHMH+GgoPW4qxARMKMS+4tkssMHWXlkS0RuGy8b/UPgLUOGrPvURPO5Tsv0Yvvo5QHF2x7sbBjPxR1LOUGEa783fL3JCJkJLA88Sw993Esu4vmz1Q6XBxz296WS7ZiIfTcpHxbqTxOKAhEyJkazLmXRk+R356qV75IyWpdhcBa55woLV5C2WL1Z69sxpVsyR1/pb54nqx6CndcqG0eRpcLjWx1Zb5kx03RVz4Cpfi26RXIgiqj6qxjI5ffqg+dIcU2nn+x+WDhgDLSiaUoZi3wJl68szISADPveDtES0tLPB6tqaljW3B3X2HeeYQSVYlUYHFQfMEv1Piz3cv/QRMvNeNO51wLfnm0ym4mFtswTj7/b+b+rxBK7JiPuFxddicB0vVhGIClAd1kEWiXWSP3fSnSvgqmqumm4NipiMy5X42fzgsu0kseopQHZ6vaYqyS7vyfmAPPBPsDix8SpeBnJAho+FHy7gK6c7bSCgrVZWTg7OTL1Bk/3MHhE4rgnBS7JD0SsQb539P0qpcpWa2rSsNa6yVw0U00eiov/K5Z9FuK6KreNGsPWd+deJW+aJ6segK3X6K5CKOriF7lScF3B56krnyCSNnbzzUrnh8IMmFmeHLFHebQGVxo4wUX6xUvVO2tKE3WOYrI7LvNwRfsrIzskZQ7gLK1tc0zqraunm3e3XW5+eNjlKyqtUPxrjFjHk2a7ZbO03dew+NPoqv/oMmz796p7pilEhEU/GDc8Qgy3qb3nCj5i0XIt8uz/08l0/1s8KruKRlp/0BvXEqm2pQoBeucimHuA+qgs92CC/SSRwYgEgCB2aYaccBpNEBiaO/k5Tp50gzv2D/jpbfjnqu0pupEVrSzGzeNYo3lYFb1eyoE1kVS+vxfklJ8yxn6w1cGIFLBOquTmH2XGX+ufeW/1BPfUUaqx3eU4VzgPnu1vvC3vOIxmn+pZh+6WihbGSkE9qCp5spHBcK3n6dXvDiw2GNHUZl5h554CRdaZcHF27/Yqjhm32kmnD94X3urFgTB9qDs7OyEcF19g7N5vvMy8+7j2/P8Rcvlt6jDZ9tF1+uHrtNRj4uBu+BH5sRvMyAPf0m9/FtKRSkoiTEkLJbdsEOQ2aS7ukkN5A73N/E0EFFVgFAKgXMmLnMfVgd+nhdcqJc+TKnoAERWPDYW+DvwbJCFnXyquupJLLub7rlaGbUdIstmqy/b22CnIBasIV94mMZOkVvPNatfRVUiSYl1Tidozr1q/Dlu4b+qJ/5ZxVXVBX7RnmR9e9LV5oLfyopHMX+G5lJ1GamN5AM3/hR95aMQdredq1e+tD0ZSVGeOd8ccrHkt7gFF5qVrwxgR+pQKMice8z4cz8akaHP0NzcPCCUnZ2dRKitrXNBTu68VC97ansyEkYuv10fdnnw2k/0I3+tIyYsdeZUVL6yUA8/VvyMu+VzZu3rFI/A+mEum1iBAukIhLd2B5SGLcEBCjCmEp2Q6jIycM5LYM4DNPZUvv0c/c6zlALcdqOCphIDpwEu0IZzRXfkpfqKe+Wtm+jur6qwtKkMfE8FmIHLGFWiP9ak8cUnaPgxfPMpZs1rFK8KBMGJjQ/FnHv16Klu4ffUk99XcQ9w27wSBKU5F7iTvqwvuInff4juvGJ7MjIf2IOnmbmPCvvutnO9Va9gQLHnnIrJzLv0IRdIfjPPv9B8+CriA3k2zuok5txjDjrnI8tIAB0dHcaYKlCKyKZNLZGIaWwc4oIM33mZWfbUdmJRDp5cfps+7HL72k/UI3+tPQPiMFgovrPDDldffl7HGlzHSr75VNPdTBHTW/2nqtYmJb7j+pGSbKJim+5cCxoAB6UQOOulaO79NO6M4Mm/NEsfRDoNZwdIMgCEJZKitve0nx8oX110RHIlPvJCuuJet3YhPfg1pSP9ZeRWGQkOJiGldtWxQSkM0FUt1rJJ4wtPYMRRcvOpeu0blBjQwGBod/YP1cEX8eKb9e9+oGIG4G3HSpTHeZ+nfFWf9yt+/0FaMFPLgERyPnCHnK7nPEQucLdN1x++OqCMdOxUHLMWmIMv4HwL33Gh+fA1DCwjrU5gzr3moLN3hcjNmzcbYxoaGvpBGcrPtrY2gjQ0DnF+Ru68RL/3O0pG4fzqRFJELr9DH3pp8Op/6Ue+rSNGSHqO8xCtkbd20nl65kNEym14BbecZYIMjBlw6U8ZyQVu0tk0YwH7Obnj/MjGt2HUQDLSRtI090F9wOnsirAlRNIQR1UVAAHOwiTs4pvMw99U8KvTow3nAnvU5XrG7Yo0+xny4mE0uyfe3D/gYKHjklnLt19gNi2lqk6Y0gis9dK4+mkaNklunqrXLa4uI3tpU6KiEuTJQXlVzGghItKcC9zUr5tzb3TL76M7Z2sJBiDSk7zvJn5ez3lYbIFvPUevXkQDmA1wzumEzLrHTJjuchvljgv16tcH1NqBtSYpc+/3Djzzo3k2YWtvb3fODR06tBzx6Etka2ur5+na2nrnd/GCGduL1zt2Koor5tPEi+0rP9KP/h8dqcjIbVXGcXP1Bb8ik3Crn8Ztlxibg1eNS6UlZ+2kc/WsB1Fs43nT9fq3KKYHJDJaQ3Mf1GNPG9QLyixKubd/S/d9RWsCSTXjLMK5Eh99mZoxX0OXqzvvKCOBs80y7xzdvBTVu6olsC5SS1c/iaGHyW+m6fWLq8vI8hbEHgs1rLemB1i5Jpfzeeqf6XN/we/dS3fN1rBQA8vIQ8/Qsx9CkHe3nWPWvD6A2aDgnNUpzL5Lj58uuWa+4yKz5vXtaW2Tprn36nFnDl5Gcn9L1znX2dlpjKmvrw8hNH2JbGnZnEzGUqkaV+rmBReb958dwI4kBM4pDzPnq0MuDl76D/P4d1TUbM+DZismAcCMO9POfdAumKGLXYh41D8nQ/LWTZquZz8kuRaed47XvBSJAdzSwNlIDc25X489DbYIZbBdP1qEoSN28U3q/q9qraCqdFW0h2zJHXO5vuRWxQLYcjbDQBntwtAR7l4rt07XG99FvPprhsBytA5XP0ONB/NNU/WGpQMRKZZR2gopBmx1h8mBp/25nn4DL7ub7pqtwdVlJCnJBnzY6XrOI/Az7tazzdo3aXuQpTD7bnPQOS67ge+40Kx9cwAiK7L/ygf0AZ8bjIwMGWtvbxeRnjMDRMT3/VQqlUwme4og9ErKMEKeSte4UifPv9h88NwA8UgCwyWaMOsuGj3VvvRD/fjf62hVGxxQRrKBO+FKfcmt/PrPeMtyPf16Atz6F7Hgct21keKV6SGNkrWHn6tmPyqZ9XLrdN38TvXJC4cjWkNXPaZHn7wTsYY3f6ke+DPteaBqXdWey/l8zBV6xp2D35ziutfKreeYTcsQG3DmgmgDXf0UNYyX30zTzUsGJNKJGzKeTvo/5MWx/eAxaSm0SSSljvpSmUgSKKpOpBU3eaaecQfnW+S26WbtWwOKvcDZaB3m3GMO+DxnNvAd55t1i6tfTBrWBpE6mnufOeD0wcjIcrHSLVsikUhtbe2g1r43b94cj0XLRN5xkbdiIaoSGcaTnZMDT0bnRvfHvzIv/VRFtICpGpGcC9yJV5mL59m3fq0e+qaxsLagzvuFGX2yvfoZd/cstX4pJSLEASDQQPdat+gGvPFL0/xOL6/bBPlstAZfeJJGHm9fv5GU7ufPVFnRE1FGOleq536gjapKZBhS4WNnqhkLZOVTrv0DmGj/FIetU3rKCvbVn5iNy7YjS1y0ga55huoP4t9MMc3vDuzZAAI+YJpODJXtBvNBiksZOuoaHUm7pbep+76oSKprbRCYXbKex54ki2/CohvMmsXYjmkYq8Oc+83Y0ziz3t1+vrf+7e0+Vw3NfcCMnTZIO7IvkVuVhdm2SgyJSEdHh9aqpqbWFdtl/kV65QuUqKa1t1I0PkRDRQ1k2/M4CUpLLnCfvVpd+Fv35q/U/V/XEQOtOVfiSRfQxb9V8UYubJEHvqqWPqgSupw8FYhYkAcawOKEb22slr74hBp+rJt3hnpvYdkAqQplTwJN+MOoIeKq4tzlAj5ulrp0Pr/5K3X/14n71PLYFkr05uUoD/CqLplo+NbGh+CaZ6h2jPzmFL1xu0SGCFlBz2brbZ6oXEU6Bz7tKn3hzW7JLRVTZHvJzgJCiUVAHgZcd/Cdjddj7oNmzCkcemzrl2B7aqoBV95nxkwbvB25ZcuWaDRaU1MzmEJF1NXVpQipdI0rtvMdF3mrXkAisr2x65N4UY6GSJV8Ksk7N+Ur+vxf2zduVA9cq0OLEwJlJO/b0UerGbfooZMFsM9+V/3hXzSAiNdbiaBn7HoyuEghcDZRT194ipqO4nmfMx88j6rpCwPOj+tzyA2VM19ISy5wJ1ypL76V3/y1uv9rKqrL+baDC/huM83lWJhLDKUv/Z7So/g3J5tNy1AW/DSoUa2GrEBxviSnf0d//oe8ZB7d+0VlQi0xUK4xl0FWqryJtpoThsAG8QbMvd8bfSp3r+PbzzXN71TrrVSEQj2ufMiMmbpTWnvwRAKgjRubhw8fYbvXy50X61VvUELB8S4lxBIkAJ/4VXX+r4JX/0c/9Jc60m9zpyiNkuNESi74hTliNpR2Kx/DQ9ea1rWIm0p5lsrFJgrnEAQCcKqJ5jxAQw6zt55pViyiJIXl+nelOQs59gv64lvsa/+jH/hLFe0jZT9y5hjDpUfSVY9KbKj87ymm5UOKA25X04zZgqd9S5/xY/faz+jBb2pTKRY6QPoejILS21tHDSFLNtDcR/Sok2zbezL/It38/oC9ZdjkMJpznxl98uCJ3Lx5cywWGzyRAGjTxo1Nw4fb7vXU9j7F0uXisLuUzQchRSOPJ3Fu/StKqa0FT2XBholo5HEEUspzuWZ+4ttq8QJlQMYD24rtfyhO+yc1/BgUOiQ1TNcdxJlmaVuGWA0x73zXICIqdF8pzOFRNOoYEuL1ryqlBozSbyW2t58N6BxqR6masa5jBXWto1gazu3yqIqQxsjjCeDWd5WQKL31Slhfm0wRt76LB79uCu1E1eL5oYxMDKErHzYjPytsbWa96lhN0dQAOyJIXIDaUapmHG1VOWc3ae2+knLj8OHDt9movkuNKmz22HMYeGW7rFjDgufv3K6e+o5q34BYeN6RiGNJj+bP/rU+6TpFJqxqSVUXgAfXMbvxDSl1m3Gn9/0yHDIZBNMYhLyjyvaG3V7u1S2Zp95/AskGCNPW3ZG+TEIpWfeS2rCYvOqhU/g2SDbSVY+bEccL+yAd7t6SHc7soJ9r8+bN8Xg8nU7vbMHLCpTCu3m7atni5EFdVokVM2nJNcvvvkdv3qSdIGYAQeDYBzcdKFP+ho66RntxAsIj8Xbm7DCBC4S0e/pb6N6oL1tAbBEeA9BjHG/nVsJQxrUtZz/jjTgOHOxoYqi8o2A3bC4TsBUddW/8gh74c82Dfh0NEKkmFUIiU0101UN6+AnEtl/QfoemyeDKuXxkIvtCuVcc+CMckPIE4NW/x+/+kT58WRkgLHvs+xzAjTqCPnudmjyHvFS/03d2LOMojETzr45GdjN9a4PuL/sEEHGq6tyIAHBda/mRr1K+FRfPM0MP/7jO0hOwFeW5N29UD1yrPN27k38wAFVdXvKtTQ2jLzxmmo6F84U0lOb8Fnn5v6nUDtU/nb7nnJR8F48/Q3/mi2oQXO4KkXsdlD0iU0iLOH7rZrzwQ71pFUUBLwKB+D5byIiD6ZivyZFzdWpEefd3+cA82s7cSseHvPxB+t0/wPlu2j/qI2ZRw8FKGYGIsCu2m1gDVT+VRyDCrmTfvgWFDnPCN5SX/JjqP7EVZewbN+gHv6E8DRLsSoHdUEamh6urHtNNR8MWYWIMyHv38yN/YZo3Qm+znGSAKJCDGzeRrnpM1R5AOyoRuotE7pVQ9liZ0CDYYgdeu4Fe/ZnqbKEoyjFt3xcL1zCMDp9NR38Bw48Ju17RRH3AEgEhWL9Inv2uXv4EFUG1SojQ5TgCHj8V0/7ZHHSmFDvsc9+LnPXjgTeYSnj8hbDVOvKxlNKqyMjXb1APfkNFdgOR4lubHk5XPWqajmEIgaTtPfndP2LRvRg9FkOPILYVvSFgh3idZNbqFa/bQ6bR7AdNtHaH6nvz5s2JRCKVSu0KUXsrlGXVUY47cLaZX7ueXv+N7txSlpogsSUpATHDB34OR16pDj5XxRt7wye9dAoHBXStk42vy/sP0bv3kjg++Dx12CUYeSLVjkW0Rta/5Oadpb75rk6P7T/uAoBLWdFGm1gFRO5fO2xPaQwhsq//TD98nYpEUTXsv1MmfrFka4bjqsdM09ECcGaDvPoTev5HsJBp38Jp/6wjtVv5NG7jIrn9UjRNUrPuIi9d3pk+cGtpaUkmk7tI5N4OZSU6Xa4/67rX4Y2b8NZNqq2ZDChioDSsD19EwI2jZML5OOIydcBU0rF+xzZWKic5ANePp3yr/E2L1rGeuedn/1ke+Vf50p3e4Vegz6kUYX2EYNH1qulIM3Ya2H08x/mIWLC45/9dPfJ9FdlePHKwN7TgplH05YVUd5B0ruK3blIv/w+153jSNDnzP/SoE1TFfBRmaE/Y5+f+nZ78Fz7xSnXxzZq8j0dG7iNQ9ogNKe+Lk/xm9/Zt9MYv9ab3iYCogvIggsCXAGIgwybKhOk08QI16iSErnponLmS6Cg/9CXkNuq5T5PzoTRICTu+6QS1crE7+Yvmwt/2QCnlM5G6+X+nYexUfdaPibyPo461CEhsplle/alWMVEfVWuH7zMBJiEqjsMvIZuXV67HknnUGcj4STjte+qwGQoQthQupCkjgN3wEh7+Jq1+Exf9WJ30LRLettzPHpKR+xSUfd1JZQQQm5NlD8ibv6bVz6kgPKPdQ1h1I3CwYA/cOEHGnUYHT8foKZQaHoo4u/x+yW72jv4yhMuOZ/Mi3HSyksDVj9N//kcyibJNJdYunkcv/tC0rWCCO+AUnPYv3rjTKqc37xtNALFFXvEovXYj3nsGFnLwcZjyLXX4DEWR8ll6KJ/0yNlmef4HtPAGNI7C5XeoA04l4R3GGVpaWrbKPfs0QVlBU8SFkSMAsu4lfnseLbtXdbaSBjxC6IiwE+sQQBRQ08gjj8OBn8MBp1D9eCSGKKhycB7Ez/6jfvrfKelxycqXn1NjTwnPlRJhCbLStQYLLsXIY+nz/5eSTeQlPr4nZTc4tV0+w14gpEz40gKQzEZZ8yyW3S/vP0itPlLgwy9Ux1+rJpxTrrLEFiBRhgAudfObv8bCf8eWDkyZq6b/lOKNNIi1xN1O5L4JZa9zGiZmEwOS3Yj3HsTS22Tdy7rEZABPV0quMZyFBTPYAzWMkxHHYPQUGnW8DD0C8Xr65TF6w9uIRZEtubP+SU37LrkA2gv3iQmpYOH31cgTzITp2FtkpJR3ToqUy7VVhCKzRfv7svZ5WvEkPvw9WrtAkNEHYvIcmjSbhh6B0EdzAYhC4FypQ5bcTi/9hNas5FEjMf2/1eFXqEGs3IjI5s2bdzuR+zSUfYJHfc4Z5o2L8Md7afkDtHk5WSDM1yoPrkAcLCOsFhGB1AyXujF641vErpxlfOBJ9KWX+trzJM5mW5SJqUi616MvV5b6ePjrQyGw1WKBAOJ86VyFTYtl3Yu0ZiFtXIIMRANNw3DI+Tj8CjrgVGXi5WgGO2hDpEMHHEtuw5u/VmtWShJ80l+paf8fxYdCLGEHSxJ7jkgAtGnTpqampvCQ2k8Eqt3zd0XCZfFQkokt8NoXsex+rHxSta5UDjCAp/ofwONgGQx4vR1gFXVHzlXDj8GQg6n2AKRGUiQ1IIBh0H6rkkdb80rbtfe2ga/3PjSQMSc2z5lmtK/A5iXYuFg2Laa296hbxIESkKbxOOgsOWQ6jZmqYvXl33clkAo9RQa4eRGW3IZ3FqiWzYjCTb6QTvknPfK48O47rAa4R4kEQBs2bBg5cuQnKOmCIFBK9Wza2F3OUBkyP8vrnsfyR9Wqp9H6PgWA7nskQqXoT99WFAGgIbGoJIdKzVjUjUPdQVR3AGpGIzUCiWEqViteom8pcNqmHNfgHRHa5uSGXjZtQYodkm2h7vXc9aG0r6D2FdT+AXWto2ypvB8zBq4fIiNPwNhT6MDTVdNnyMQq751PAHSk/IS5Fv7gUXlngVr1e5VxEoMcciaf9G094WwVmrDbXRXrIbK1tTWZTCYSiT2kYCmTyWQymd0rKZnZ8zyEdWG2s/QnAsAYIyLJZHK3njot5fpSSpetflvExtd5xZNY9bRqeZtyRdKV0wy2gjIEWhjswkJaqGwdEwXyFEdrEKtDfIgkhlCiQRJDkBiKeCPFaxGpk2hKmRh5SZgodATKE+WVB0HpMG4qwsQWHMD5YosI8hzkqJRBoVOKbZJvVbnNktuCwhaVbZViGxXaqSgIyqlq4gEJJXUHcdNkjDpBjTqRhk2ixNCKvSHiSkQa2ivzXezkNc/Jsvtp1dPU2kwBOE188Pk48Vpz0HQJa3sP+nxB3/c7OzuHDRu250w+EhHnXD6f341/Q0Si0SgzB0GwfSi11qEKaGtrA1BXV2fM7i1l20tnrzfQtpzXPk9LblUrFyoKa8dvo4IrR1pU8n16nFwGh1XgKrBWkjqEAAVRgAKUEaVJe0KVgsVEpJQ4V95CzhbihC2xJbZgAYO4/20FrCAaFIEk6lE7hhsm0rDDaeiRGHII1Y1TXqq31318l7B36F7D617GB0+oNX9QrWupBNaQIcNl4kU45ho18kSFno28O6GmPiYo9xKPpVAoZDKZMEt5z3gMDBHp4yjw8vtl4Q908+ukK1ySAjsIRFPlKCDpX5qCKrBiG5uvv1PcN3++JxOpB/cwHCU9BEEIIIgBokmJN0p6pNQdgIZDVMN4qh+P2rFIDicdQR9rYdtUSslu5JYlWPcirXuBNi1GVwcFAEFSHo+eQpNm0qGXIDWcwuPUCTuFY0hhsVhk5kRiD4bG9giUPe/Q4F+mcpqtSEdHh3MunU7HYjHsoQPRKwUaQcpmNqgbDlN+Nkx/FBEXraFoGtlNKDgVJnwaQKlK9Xnp5wsPMKq9u7/KxSjLoAIg0qyjYqIUSUq0lhKNSA6T1EiqHS3pMVQ7mtIjJTEsdLC2Vai9u9BtAcU2yWxC12q0r0Tre2h9D+0rkGnVPuAgGpyKyvCj5ODz9CHnY/jRqif8STt9GHA4EaVSqaWlZfTo0US05zzjvUhS9nV92tvbjTE1NTWhbbpnNIWALSvD8043HzyHmAcb2EQjrlmoa8ZIx2re9CY1L0LL22hdTtktFIBCTDSgw4MXVH8BiZ7ttxJJcqqJ4o0cq6PUSMQbJd6AeB0lh1O8QeL1iNVQrAFeqiffm3qJFnE++TnnZ8jm4efgZ6TQiUIb5VqQ2SjZjZTdhNxmKrSh2EUBw1VoVRAPXDuCRhyDg86gAz9PwyaXxXv5VdQfIdQajn8QBC0tLcOGDYtE9uxZonsdlD38FYvFtra2eDxeW1sb+ua7H022rIx78QfmsX+gVBy5gj36cjXjrp56e2VNm2+Vjg+w+R20LEXru9S+SrLNqlgiBwqLrYWkqsoRIWW1rMLdkkppISMmBuVBR5Q2TIqUFmUkdC/Kpw44sCMOyJZEmFyJbZGcT7YEZmEQV86n6++li4JEFNeMoiGHYdSJMmYKjTiWEkN7bYvBpkLvQGu3tbU1NTXtbqN/H5GUfVsul+vu7o5Go3sETXEgzc2v4dcnKaNdMZCZ8/QRV5LY8ICpci2hynSWR8rmObNB2j5A+wpq/wDtK5FZK9lNKt8J68j1uj5lm5P6R4m2q/a3/t/+BqgAILAGYmkkm1A3DkMO46bJqulIapyoonXVTJRdypDvIbK7u7u+vt7zvI9hnWVvhzJs3d3d+Xw+rK+wW9EM4yG+u/FI07Lc1gyla5eqZNPWKRdl7cx9F1T6Bb7FUaGdcy3INkt3M3VvQLYZ2Rbkt0ixg0oZ+BmyBVgfbKkScd96jyGVmaMw9qQ9MVGJpBFJIVaPxDCkh6N2rNSORd04qhlLyeHKi/fbPFYGceAamR+JyK6uriAIGhoalFIfz3Qb7AutpqYmnU5ns9n29nYiqqmp6TFrdo1OAjvSERz4ef7wffrMaTrZVCVxsBwYUn29bOqp5kWKSCMxVCeGYuikbX1+BDkOcuLnEeQpyIstOFuA9YkDcj6ECZBQmytDJqZMAl6cvYR4SRVJUiQNHR1oSYl6XxXaFR090GJbGKprbGz8OBf89g0owwFKp9Mhmtlslpnj8Xgymdw9gzXhLHn25zj0krJE3MHUViKX1I+9shXa7/QkRUTwUtpLIdErnL1ByvB+G9v6LGn2RE93N4VbuZutra2JRGKH9ag+vVD2tFQq1RPULBaLWut0Ov3RVylJCaBGHOtGjdVjpgD0kTZr91nypm3p6lHT0qOl+yjubXaTU79AaPnOA1XC3jMtXOerr6+Px+OfgADaJ2zKgZpzrqury/f9eDzued5Hjuiy84Mlt5rPfEF/1EK0fzLNWhsuOzc0NISR448/U2cfhrLveBWLxY6ODqVUKpWKRCJhdHPQzo5AREjCis2ET+8p4qFDWVdXF65cfGKm2j4tKbdCk5lLpVJnZ6eIpNPpeDzeN6i23Ze+EnqB+nTimM/nOzo6kslkbW3tJyUg/3SgrMpcEASFQiGbzYayMxaLDZrOT0XrOwKlUqmjoyMSidTU1HwMgfFPF5QDuZC+7+fz+SAIQm+97xJZ+OyfKkD74hhKx1gslk6n9/TK4X4oq9MZprfkcjmtdSg+t/LZ/4Ql6FZGTnd3d6lUikQiW72l+6H8ZBozFwqFIAistUEQGGNSqVQ0Gt1queJPA9CtniKMowHwPC+dTu8lyno/lFuLz1wu55wLZy5ME4xGo1WjnvsupsVisVAohLsAQhtmL3+iTymU285HEAT5fN73fQBaa621UioSiUQikW1nbu8HNFQIpVKJmZ1ziUQimUz2aIO9vP+fakk5kK/DzKF7VCqVtNbGmDA7JmS0al5CzzB+DJM9kH/mnCuVSs65IAiCIAAQbu/aV1jcD+XOTXYQBJlMxvd9ItJa90hQpZTneYNZ5Ow7zkQDDvtWP9o+Q2HHmNlaWyqVwh1RYdL+Ph0C2w/lTjMaKsQQiDA1JNwiHApUpZQxJhROoQ2wW3QxM4db/Jxz1lrf9621ofBOJBLGmNDk+NMwgvdDuauMhj8KcQl5DTEKeQ2v11pba+PxeKFQiMfj8Xg8m82GXnDPbX3f11rHYrFcLsfMWutQBYc3EZGampqQ/pB1Y8y+aOwOpv3/gSEgxjioFBoAAAAASUVORK5CYII=';

@Injectable({ providedIn: 'root' })
export class PdfService {
  constructor(private col: CollectionService) {}

  exportMissing(): void {
    const doc = new jsPDF();
    const user = this.col.currentUser() ?? 'Usuario';
    const missingIds = new Set(this.col.getMissingIds());
    let y = this.header(doc, 'Postales Faltantes', user);
    doc.setFontSize(9); doc.setTextColor(120);
    doc.text('Faltan: ' + this.col.missingCount() + ' de ' + this.col.totalBase + '   -   ' + this.today(), 14, y);
    y += 10;

    const fwcM = FWC_STICKERS.filter(s => missingIds.has(s.id)).map(s => s.id);
    if (fwcM.length) y = this.block(doc, 'Seccion FWC', fwcM, y);

    for (const team of TEAMS) {
      const ids = team.stickers.filter(s => missingIds.has(s.id)).map(s => s.id);
      if (ids.length) y = this.block(doc, team.name, ids, y);
    }

    const cocaM = COCA_STICKERS.filter(s => missingIds.has(s.id)).map(s => s.id);
    if (cocaM.length) y = this.block(doc, 'Coca-Cola', cocaM, y);

    doc.save('urisco_faltantes_' + user + '.pdf');
  }

  exportRepeated(): void {
    const doc = new jsPDF();
    const user = this.col.currentUser() ?? 'Usuario';
    const repMap = this.col.getRepeatedMap();
    let y = this.header(doc, 'Postales Repetidas', user);
    doc.setFontSize(9); doc.setTextColor(120);
    doc.text('Total repetidas: ' + this.col.repeatedCount() + '   -   ' + this.today(), 14, y);
    y += 10;

    if (Object.keys(repMap).filter(k => repMap[k] > 0).length === 0) {
      doc.setFontSize(11); doc.setTextColor(100);
      doc.text('No tenes postales repetidas aun.', 14, y);
    } else {
      const fwcR = FWC_STICKERS.filter(s => (repMap[s.id] ?? 0) > 0);
      if (fwcR.length) y = this.repBlock(doc, 'Seccion FWC', fwcR.map(s => s.id + 'x' + repMap[s.id]), y);
      for (const team of TEAMS) {
        const tr = team.stickers.filter(s => (repMap[s.id] ?? 0) > 0);
        if (tr.length) y = this.repBlock(doc, team.name, tr.map(s => s.id + 'x' + repMap[s.id]), y);
      }
      const cocaR = COCA_STICKERS.filter(s => (repMap[s.id] ?? 0) > 0);
      if (cocaR.length) y = this.repBlock(doc, 'Coca-Cola', cocaR.map(s => s.id + 'x' + repMap[s.id]), y);
    }

    doc.save('urisco_repetidas_' + user + '.pdf');
  }

  exportAll(): void {
    const doc = new jsPDF();
    const user = this.col.currentUser() ?? 'Usuario';
    const missingIds = new Set(this.col.getMissingIds());
    let y = this.header(doc, 'Coleccion Completa', user);
    doc.setFontSize(9); doc.setTextColor(120);
    doc.text('Tengo: ' + this.col.ownedCount() + ' | Faltan: ' + this.col.missingCount() + ' | ' + this.col.completionPct() + '%   -   ' + this.today(), 14, y);
    y += 10;

    // FWC
    const fwcOwned   = FWC_STICKERS.filter(s => !missingIds.has(s.id)).map(s => s.id);
    const fwcMissing = FWC_STICKERS.filter(s =>  missingIds.has(s.id)).map(s => s.id);
    if (fwcOwned.length || fwcMissing.length)
      y = this.teamBlock(doc, 'Seccion FWC', fwcOwned.length, 20, fwcOwned, fwcMissing, y);

    for (const team of TEAMS) {
      const owned   = team.stickers.filter(s => !missingIds.has(s.id)).map(s => s.id);
      const missing = team.stickers.filter(s =>  missingIds.has(s.id)).map(s => s.id);
      if (owned.length > 0)
        y = this.teamBlock(doc, team.name, owned.length, 20, owned, missing, y);
    }

    const cocaOwned   = COCA_STICKERS.filter(s => !missingIds.has(s.id)).map(s => s.id);
    const cocaMissing = COCA_STICKERS.filter(s =>  missingIds.has(s.id)).map(s => s.id);
    if (cocaOwned.length > 0)
      y = this.teamBlock(doc, 'Coca-Cola', cocaOwned.length, 14, cocaOwned, cocaMissing, y);

    doc.save('urisco_coleccion_' + user + '.pdf');
  }

  // ── Texto para WhatsApp ───────────────────────────────────
  exportAsText(type: 'missing' | 'repeated' | 'all'): string {
    const user = this.col.currentUser() ?? 'Usuario';
    const missingIds = new Set(this.col.getMissingIds());
    const repMap = this.col.getRepeatedMap();
    const lines: string[] = [];

    lines.push('URISCO PANINI 2026 - ' + user);
    lines.push(this.today());
    lines.push('');

    if (type === 'missing') {
      lines.push('FALTAN (' + this.col.missingCount() + ')');
      lines.push('');
      const fwcM = FWC_STICKERS.filter(s => missingIds.has(s.id)).map(s => s.id);
      if (fwcM.length) { lines.push('*Seccion FWC*'); lines.push(fwcM.join('  |  ')); lines.push(''); }
      for (const team of TEAMS) {
        const ids = team.stickers.filter(s => missingIds.has(s.id)).map(s => s.id);
        if (ids.length) { lines.push('*' + team.name + '* (' + ids.length + ')'); lines.push(ids.join('  |  ')); lines.push(''); }
      }
      const cocaM = COCA_STICKERS.filter(s => missingIds.has(s.id)).map(s => s.id);
      if (cocaM.length) { lines.push('*Coca-Cola*'); lines.push(cocaM.join('  |  ')); }

    } else if (type === 'repeated') {
      lines.push('Repetidas - URISCO PANINI 2026 - ' + user);
      lines.push(this.today());
      lines.push('');
      const numFmt = (id: string, prefix: string, count: number) => {
        const num = id.replace(prefix, '').replace(/^0+/, '');
        return count > 1 ? num + 'x' + count : num;
      };
      const fwcFoil = FWC_STICKERS.filter(s => s.type === 'foil'    && (repMap[s.id] ?? 0) > 0);
      const fwcHist = FWC_STICKERS.filter(s => s.type === 'history' && (repMap[s.id] ?? 0) > 0);
      if (fwcFoil.length) lines.push('FWC (intro): ' + fwcFoil.map(s => numFmt(s.id, 'FWC', repMap[s.id])).join(', '));
      if (fwcHist.length) lines.push('FWC (hist): '  + fwcHist.map(s => numFmt(s.id, 'FWC', repMap[s.id])).join(', '));
      for (const team of TEAMS) {
        const tr = team.stickers.filter(s => (repMap[s.id] ?? 0) > 0);
        if (tr.length) lines.push(team.name + ' ' + team.flag + ': ' + tr.map(s => numFmt(s.id, team.code, repMap[s.id])).join(', '));
      }
      const cocaR = COCA_STICKERS.filter(s => (repMap[s.id] ?? 0) > 0);
      if (cocaR.length) lines.push('CC (Coca-Cola): ' + cocaR.map(s => numFmt(s.id, 'CC', repMap[s.id])).join(', '));

    } else {
      lines.push('RESUMEN: ' + this.col.ownedCount() + '/' + this.col.totalBase + ' (' + this.col.completionPct() + '%)');
      lines.push('Coca-Cola: ' + this.col.cocaOwnedCount() + '/14');
      lines.push('Repetidas: ' + this.col.repeatedCount());
      lines.push('');
      for (const team of TEAMS) {
        const owned = team.stickers.filter(s => !missingIds.has(s.id));
        if (owned.length > 0)
          lines.push(team.name + ': ' + owned.length + '/20  →  ' + owned.map(s => s.id).join('  |  '));
      }
    }
    return lines.join('\n');
  }

  copyToClipboard(type: 'missing' | 'repeated' | 'all'): void {
    const text = this.exportAsText(type);
    navigator.clipboard.writeText(text).then(() => {
      alert('Copiado! Podes pegarlo en WhatsApp.');
    });
  }

  // ── Helpers ───────────────────────────────────────────────
  private header(doc: jsPDF, subtitle: string, user: string): number {
    try { doc.addImage(LOGO_B64, 'PNG', 143, 4, 50, 21); } catch(e) {}
    doc.setFontSize(20); doc.setTextColor(255,130,0); doc.setFont('helvetica','bold');
    doc.text('URISCO', 14, 16);
    doc.setFontSize(9); doc.setTextColor(140); doc.setFont('helvetica','normal');
    doc.text('PANINI - FIFA WORLD CUP 2026', 14, 23);
    doc.setDrawColor(255,130,0); doc.setLineWidth(0.4);
    doc.line(14, 27, 196, 27);
    doc.setFontSize(13); doc.setTextColor(30); doc.setFont('helvetica','bold');
    doc.text(subtitle + ' - ' + user, 14, 36);
    doc.setFont('helvetica','normal');
    return 44;
  }

  private block(doc: jsPDF, title: string, ids: string[], y: number): number {
    y = this.pg(doc, y, 14);
    doc.setFillColor(235, 240, 255);
    doc.rect(13, y - 4, 184, 7, 'F');
    doc.setFontSize(8); doc.setTextColor(40,80,160); doc.setFont('helvetica','bold');
    doc.text(title, 15, y);
    y += 6;
    doc.setFont('helvetica','normal'); doc.setTextColor(50);
    for (const chunk of this.chunks(ids, 18)) {
      y = this.pg(doc, y, 5);
      doc.text(chunk.join('  '), 15, y);
      y += 5;
    }
    return y + 2;
  }

  private repBlock(doc: jsPDF, title: string, items: string[], y: number): number {
    y = this.pg(doc, y, 14);
    doc.setFillColor(235, 245, 255);
    doc.rect(13, y - 4, 184, 7, 'F');
    doc.setFontSize(9); doc.setTextColor(40,80,160); doc.setFont('helvetica','bold');
    doc.text(title, 15, y);
    y += 6;
    doc.setFont('helvetica','normal'); doc.setFontSize(8);
    for (const item of items) {
      const dashIdx = item.lastIndexOf('x');
      const id    = item.substring(0, dashIdx);
      const count = parseInt(item.substring(dashIdx + 1));
      y = this.pg(doc, y, 5);
      doc.setTextColor(30, 30, 120);
      doc.setFont('helvetica','bold');
      doc.text(id, 20, y);
      doc.setFont('helvetica','normal');
      doc.setTextColor(60);
      doc.text('->  ' + count + (count === 1 ? ' repetida' : ' repetidas'), 58, y);
      y += 5.5;
    }
    return y + 2;
  }

  private teamBlock(doc: jsPDF, title: string, ownedCount: number, total: number, owned: string[], missing: string[], y: number): number {
    y = this.pg(doc, y, 12);
    const pct = Math.round((ownedCount / total) * 100);
    doc.setFillColor(235, 248, 235);
    doc.rect(13, y - 4, 184, 7, 'F');
    doc.setFontSize(8); doc.setTextColor(30,100,30); doc.setFont('helvetica','bold');
    doc.text(title + '  -  ' + ownedCount + '/' + total + '  (' + pct + '%)', 15, y);
    y += 5;
    doc.setFont('helvetica','normal'); doc.setFontSize(8);
    if (owned.length) {
      for (const chunk of this.chunks(owned, 18)) {
        y = this.pg(doc, y, 5);
        doc.setTextColor(30,120,30);
        doc.text('+ ' + chunk.join('  '), 15, y);
        y += 4.5;
      }
    }
    if (missing.length) {
      for (const chunk of this.chunks(missing, 18)) {
        y = this.pg(doc, y, 5);
        doc.setTextColor(160,40,40);
        doc.text('- ' + chunk.join('  '), 15, y);
        y += 4.5;
      }
    }
    return y + 3;
  }

  private pg(doc: jsPDF, y: number, needed: number): number {
    if (y + needed > 278) {
      doc.addPage();
      doc.setFontSize(7); doc.setTextColor(180); doc.setFont('helvetica','normal');
      doc.text('URISCO - PANINI 2026', 14, 8);
      doc.setDrawColor(220); doc.setLineWidth(0.2); doc.line(14, 10, 196, 10);
      return 15;
    }
    return y;
  }

  private chunks<T>(arr: T[], size: number): T[][] {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  }

  private today(): string { return new Date().toLocaleDateString('es-CR'); }
}