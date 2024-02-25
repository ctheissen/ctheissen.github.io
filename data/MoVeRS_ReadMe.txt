J/AJ              MoVeRS Catalog (Version 4) Schema            (Theissen+, 2016)
================================================================================
Motion Verified Red Stars (MoVeRS): A Catalog of Proper Motion Selected Low-mass
   Stars from WISE, SDSS, and 2MASS
       Theissen C.A., West A.A., Dhital S.
      <*Astronom. J.*>
      =
================================================================================
ADC_Keywords: Astrometric data ; Combined data ;
              Stars, dwarfs ; Stars, M-type
Keywords: catalogs — infrared: stars — proper motions — stars: low-mass — 
          stars: kinematics and dynamics — stars: late-type
Abstract:
    We present a photometric catalog of 8,735,004 proper motion selected low-
    mass stars (KML-spectral types) within the Sloan Digital Sky Survey (SDSS) 
    footprint, from the combined Sloan Digital Sky Survey (SDSS) Data Release 10 
    (DR10), Two-Micron All-Sky Survey (2MASS) Point Source Catalog (PSC), and 
    Wide-field Infrared Survey Explorer (WISE) AllWISE catalog. Stars were 
    selected using r-i, i-z, r-z, z-J, and z-W1 colors, and SDSS, WISE, and 
    2MASS astrometry was combined to compute proper motions. The resulting 
    3,518,150 stars were augmented with proper motions for 5,216,854 earlier 
    type stars from the combined SDSS and United States Naval Observatory B1.0 
    catalog (USNO-B). We used SDSS+USNO-B proper motions to determine the 
    best criteria for selecting a clean sample of stars. Only stars whose proper 
    motions were greater than their 2-sigma uncertainty were included. Our 
    Motion Verified Red Stars (MoVeRS) catalog is available through SDSS CasJobs 
    and VizieR.
Description:
    MoVeRS Catalog.

File Summary:
--------------------------------------------------------------------------------
 FileName      Lrecl    Records    Explanations
--------------------------------------------------------------------------------
ReadMe.txt        98          .   This file
MoVeRS.fits     2880    8735004   Astrometry for 8735004 low-mass stars
--------------------------------------------------------------------------------


Byte-by-byte Description of file: MoVeRS.fits
--------------------------------------------------------------------------------
   Bytes Format Units     Label               Explanations
--------------------------------------------------------------------------------
          A22   ---       SDSS_OBJID          SDSS DR8 Object ID
          E5.3  deg       SDSS_RA             SDSS Right ascension (J2000.0)
          E5.3  deg       SDSS_DEC            SDSS Declination (J2000.0)
          E5.3  deg       SDSS_RAERR          SDSS Right ascension err. (J2000.0)
          E5.3  deg       SDSS_DECERR         SDSS Declination err. (J2000.0)
          E5.3  d         SDSS_MJD            SDSS Modified Julian Date
          E5.3  mag       UMAG                SDSS u-band PSF magnitude
          E5.3  mag       GMAG                SDSS g-band PSF magnitude
          E5.3  mag       RMAG                SDSS r-band PSF magnitude
          E5.3  mag       IMAG                SDSS i-band PSF magnitude
          E5.3  mag       ZMAG                SDSS z-band PSF magnitude
          E5.3  mag       UMAG_ERR            SDSS u-band PSF magnitude error
          E5.3  mag       GMAG_ERR            SDSS g-band PSF magnitude error
          E5.3  mag       RMAG_ERR            SDSS r-band PSF magnitude error
          E5.3  mag       IMAG_ERR            SDSS i-band PSF magnitude error
          E5.3  mag       ZMAG_ERR            SDSS z-band PSF magnitude error
          E5.3  deg       LGAL                SDSS Galactic longitude
          E5.3  deg       BGAL                SDSS Galactic latitude
          E5.3  deg       2MASS_RA            2MASS Right ascension (J2000.0)
          E5.3  deg       2MASS_DEC           2MASS Declination (J2000.0)
          E5.3  deg       2MASS_RAERR         2MASS Right ascension err. (J2000.0)
          E5.3  deg       2MASS_DECERR        2MASS Declination err. (J2000.0)
          A3    ---       2MASS_PH_QUAL       2MASS photometric quality flag
          A3    ---       2MASS_RD_FLG        2MASS read flag
          A3    ---       2MASS_BL_FLG        2MASS blend flag
          A3    ---       2MASS_CC_FLG        2MASS contam. and confusion flag
          I2    ---       2MASS_GAL_CONTAM    2MASS extended source contam. flag
          E5.3  d         2MASS_MJD           2MASS modified Julian date
          E5.3  mag       JMAG                2MASS J-band PSF magnitude
          E5.3  mag       JMAG_ERR            2MASS J-band PSF corr. mag. uncert.
          E5.3  mag       JMAG_ERRTOT         2MASS J-band PSF total mag. uncert.
          E5.3  ---       JSNR                2MASS J-band SNR
          E5.3  mag       HMAG                2MASS H-band PSF magnitude
          E5.3  mag       HMAG_ERR            2MASS H-band PSF corr. mag. uncert.
          E5.3  mag       HMAG_ERRTOT         2MASS H-band PSF total mag. uncert.
          E5.3  ---       HSNR                2MASS H-band SNR
          E5.3  mag       KMAG                2MASS K-band PSF magnitude
          E5.3  mag       KMAG_ERR            2MASS K-band PSF corr. mag. uncert.
          E5.3  mag       KMAG_ERRTOT         2MASS K-band PSF total mag. uncert.
          E5.3  ---       KSNR                2MASS K-band SNR
          E5.3  ---       J_PSFCHI            2MASS J-band chi2 PSF fit
          E5.3  ---       H_PSFCHI            2MASS H-band chi2 PSF fit
          E5.3  ---       K_PSFCHI            2MASS K-band chi2 PSF fit
          E5.3  deg       WISE_RA             WISE Right ascension (J2000.0)
          E5.3  deg       WISE_DEC            WISE Declination (J2000.0)
          E5.3  deg       WISE_RAERR          WISE Right ascension err. (J2000.0)
          E5.3  deg       WISE_DECERR         WISE Declination err. (J2000.0)
          A4    ---       WISE_CC_FLG         WISE contam. and confusion flag
          I2    ---       WISE_EXT_FLG        WISE extended source flag
          A4    ---       WISE_VAR_FLG        WISE variability flag
          A4    ---       WISE_PH_QUAL        WISE photometric quality flag
          E5.3  d         W1MJDMEAN           WISE W1-band average modified Julian Date
          E5.3  mag       W1MPRO              WISE W1-band PSF magnitude
          E5.3  mag       W1SIGMPRO           WISE W1-band PSF magnitude error
          E5.3  ---       W1SNR               WISE W1-band SNR
          E5.3  d         W1MJDSIG            WISE MJD uncertainty (1)
          E5.3  ---       W1RCHI2             WISE W1 reduced chi2 PSF fit
          E5.3  arcsec    NEAREST_NEIGHBOR    Distance to nearest SDSS primary object
          E5.3  mag       NEAREST_RMAG        SDSS r-band PSF mag. of nearest neighbor
          E5.3  mag       NEAREST_IMAG        SDSS i-band PSF mag. of nearest neighbor
          E5.3  mag       NEAREST_ZMAG        SDSS z-band PSF mag. of nearest neighbor
          I2    ---       NEIGHBORS           Number of SDSS primary objects within 15”
          I2    ---       RR1                 Flag indicating there is an object within 8” with $r_source-r_neighbor >= -1
          I2    ---       RR2                 Flag indicating there is an object within 8” with $r_source-r_neighbor >= -2
          I2    ---       RR2.5               Flag indicating there is an object within 8” with $r_source-r_neighbor >= -2.5
          I2    ---       RR3                 Flag indicating there is an object within 8” with $r_source-r_neighbor >= -3
          I2    ---       RR4                 Flag indicating there is an object within 8” with $r_source-r_neighbor >= -4
          I2    ---       RR5                 Flag indicating there is an object within 8” with $r_source-r_neighbor >= -5
          E5.3  mas/yr    PMRA                Proper motion in R.A. (proper units, i.e. pmRA*cos(Decl.)
          E5.3  mas/yr    PMDEC               Proper motion in Decl.
          E5.3  mas/yr    PMRA_TOTERR         Combined error in proper motion in R.A.
          E5.3  mas/yr    PMDEC_TOTERR        Combined error in proper motion in Decl.
          E5.3  mas/yr    PMRA_INTERR         Intrinsic error in proper motion in R.A.
          E5.3  mas/yr    PMDEC_INTERR        Intrinsic error in proper motion in Decl.
          E5.3  mas/yr    PMRA_MEASERR        Measurement error in proper motion in R.A.
          E5.3  mas/yr    PMDEC_MEASERR       Measurement error in proper motion in Decl.
          E5.3  mas/yr    PMRA_FITERR         Fit error in proper motion in R.A.
          E5.3  mas/yr    PMDEC_FITERR        Fit error in proper motion in Decl.
          E5.3  yr        BASELINE            Time baseline used to compute proper motion
          A3    ---       DBIT                Proper motion detection flag (2)
          I2    ---       RECOMP              Flag indicating proper motions were recomputed (3)
          I2    ---       USE                 Flag indicating which proper motions are available (4)
          E5.3  mas/yr    PMRA_M04            M04 Proper motion in R.A. (proper units, i.e. pmRA*cos(Decl.) (5)
          E5.3  mas/yr    PMDEC_M04           M04 Proper motion in Decl. (5)
          E5.3  mas/yr    PMRAERR_M04         M04 error in pmRA (5)
          E5.3  mas/yr    PMDECERR_M04        M04 error in pmDEC (5)
          I2    ---       MATCH_M04           Number of SDSS objects within a 1” radius matching the USNO-B object (5)
          E5.3  mas       SIGRA_M04           M04 RMS residual for pmRA fit (5)
          E5.3  mas       SIGDEC_M04          M04 RMS residual for pmDEC fit (5)
          I2    ---       NFIT_M04            Number of detections used in the M04 fit (5)
          E5.3  mag       O_M04               Recalibrated USNO-B O mag, recalibrated to SDSS g (5)
          E5.3  mag       J_M04               Recalibrated USNO-B J mag, recalibrated to SDSS g (5)
          E5.3  arcsec    WS_DIST             Total distance between WISE position and SDSS position 
          E5.3  arcsec    S2_DIST             Total distance between SDSS position and 2MASS position 
          E5.3  arcsec    W2_DIST             Total distance between WISE position and 2MASS position 
          A22   ---       GALEX_OBJID         GALEX object designation
          E5.3  deg       GALEX_RA            GALEX Right ascension (J2000.0)
          E5.3  deg       GALEX_DEC           GALEX Declination (J2000.0)
          E5.3  mag       NUV_MAG             GALEX NUV magnitude
          E5.3  mag       NUV_MAGERR          GALEX NUV magnitude error
          E5.3  mag       FUV_MAG             GALEX FUV magnitude
          E5.3  mag       FUV_MAGERR          GALEX FUV magnitude error
          E5.3  ---       GToSDstArcSec                angular separation in arc seconds, the radius used for matching is 5"
          I2    ---       distanceRank                 1 = for a given GALEX object with an SDSS match, that match is the closest, 2 = the next closest, etc. 
          I2    ---       reverseDistanceRank          1 = for a given SDSS object with a GALEX match, that match is the closest, 2 = the next closest, etc.
          I2    ---       multipleMatchCount           how many SDSS objects matched GALEX object within the 5" match radius.
          I2    ---       reverseMultipleMatchCount    how many GALEX objects matched SDSS object within the 5" match radius.
          E5.3  pc        DIST                         Photometric parallax distance (6)
          E5.3  mag       M_r                          Absolute SDSS r-band magnitude using photometric parallax distances
--------------------------------------------------------------------------------
Note (1): Defined as .5*(W1MJDMAX-W1MJDMIN)
Note (2): See Section 3.3 of the paper
Note (3): See Section 3.4.1 of the paper
Note (4): 1: Our proper motion; 2: M04 proper motion; 3: both proper motions
Note (5): Values taken from Munn et al. 2004, 2008
Note (6): Computed using the relationships in Bochanski et al. 2010
Note (G1): Null values are represented with -9999
--------------------------------------------------------------------------------


Author's address: 
    Christopher Theissen <ctheisse@bu.edu>

References:
  Munn, Monet, Levine, et al., 2004AJ....127...3034M,
    An Improved Proper-Motion Catalog Combining USNO-B and the 
    Sloan Digital Sky Survey 
  Munn, Monet, Levine, et al., 2008AJ....136...895M,
    Erratum: "an Improved Proper-Motion Catalog Combining USNO-B 
    and the Sloan Digital Sky Survey"
  Bochanski, Hawley, Covey, et al., 2010AJ....139...2679,
    The Luminosity and Mass Functions of Low-mass Stars in the 
    Galactic Disk. II. The Field
  
================================================================================
(End)               Christopher Theissen [BU, United States]         15-Apr-2015
