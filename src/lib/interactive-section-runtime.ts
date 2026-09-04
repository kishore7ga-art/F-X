/**
 * Interactive Section Runtime Delegator
 *
 * Ensures all interactive navbar mega-menus, dropdown lists, mobile drawers,
 * accordion toggles, FAQ expanders, and tab switchers work natively and
 * interactively in both the Editor Studio canvas and the Published Site Viewer,
 * matching the isolated iframe preview experience in the Admin Studio.
 */

export function handleInteractiveSectionClick(event: MouseEvent | React.MouseEvent): boolean {
  const target = event.target as HTMLElement | null;
  if (!target) return false;

  // 1. Desktop Mega-Menu & Dropdown Navigation (Mesa / Newton / NIAT / Masters' Union patterns)
  const navTrigger = target.closest<HTMLElement>(
    ".nav-trigger, .nav-item[data-menu], .has-drop, .has-dropdown, .niat-nav-btn, .ns-dropdown-btn, .sc-dropdown-btn, .dropdown-toggle, [data-menu], [data-panel]"
  );

  if (navTrigger) {
    const navItem =
      target.closest<HTMLElement>(".nav-item[data-menu]") ||
      target.closest<HTMLElement>(".nav-item") ||
      target.closest<HTMLElement>(".has-drop") ||
      target.closest<HTMLElement>(".has-dropdown") ||
      target.closest<HTMLElement>("[data-panel]") ||
      navTrigger;

    const section =
      navTrigger.closest<HTMLElement>("[data-xite-section], header, .section-wrapper-container, section") ||
      document.body;

    // A. Mesa Mega Menu pattern (.nav-item[data-menu] -> #menu-{key})
    const menuKey = navItem?.getAttribute("data-menu") || navTrigger.getAttribute("data-menu");
    if (menuKey) {
      event.preventDefault();
      event.stopPropagation();

      const isOpen = navItem?.classList.contains("open") ?? false;
      const targetMenu =
        section.querySelector<HTMLElement>(`#menu-${menuKey}`) ||
        document.getElementById(`menu-${menuKey}`) ||
        section.querySelector<HTMLElement>(`.mega-menu[data-menu="${menuKey}"]`);

      // Close other open nav items & mega menus in this section
      section.querySelectorAll<HTMLElement>(".nav-item.open").forEach((el) => el.classList.remove("open"));
      section.querySelectorAll<HTMLElement>(".mega-menu.active").forEach((el) => el.classList.remove("active"));

      if (!isOpen && navItem) {
        navItem.classList.add("open");
        if (targetMenu) {
          targetMenu.classList.add("active");
        }
      }
      return true;
    }

    // B. NIAT Panel pattern (data-panel -> #panel-{panelId} & #niatDropdownWrapper)
    const panelId = navItem?.getAttribute("data-panel") || navTrigger.getAttribute("data-panel");
    if (panelId) {
      event.preventDefault();
      event.stopPropagation();

      const dropdownWrapper =
        section.querySelector<HTMLElement>("#niatDropdownWrapper") ||
        section.querySelector<HTMLElement>(".dropdown-wrapper") ||
        document.getElementById("niatDropdownWrapper");

      const targetPanel =
        section.querySelector<HTMLElement>(`#panel-${panelId}`) ||
        document.getElementById(`panel-${panelId}`);

      const dropItems = section.querySelectorAll<HTMLElement>(".has-drop, [data-panel]");
      const panels = section.querySelectorAll<HTMLElement>(".niat-panel, .dropdown-panel");

      const isAlreadyOpen = navItem?.classList.contains("active-open") || navItem?.classList.contains("open");

      dropItems.forEach((el) => el.classList.remove("active-open", "open"));
      panels.forEach((p) => p.classList.remove("active"));

      if (isAlreadyOpen) {
        if (dropdownWrapper) dropdownWrapper.style.display = "none";
      } else {
        if (dropdownWrapper) dropdownWrapper.style.display = "block";
        if (targetPanel) targetPanel.classList.add("active");
        if (navItem) navItem.classList.add("active-open", "open");
      }
      return true;
    }

    // C. Generic Dropdown toggle (.has-drop / .has-dropdown / .dropdown-toggle)
    if (
      navItem &&
      (navItem.classList.contains("has-drop") ||
        navItem.classList.contains("has-dropdown") ||
        navItem.classList.contains("dropdown"))
    ) {
      event.preventDefault();
      event.stopPropagation();

      const isOpen = navItem.classList.contains("open");
      const dropItems = section.querySelectorAll<HTMLElement>(".has-drop, .has-dropdown, .dropdown");
      dropItems.forEach((el) => el.classList.remove("open"));

      if (!isOpen) {
        navItem.classList.add("open");
        const subMenu = navItem.querySelector<HTMLElement>(".dropdown-menu, .sub-menu, .mega-menu");
        if (subMenu) subMenu.classList.add("active", "open");
      }
      return true;
    }
  }

  // 2. Mobile Navigation Drawers (Open & Close)
  const drawerOpenTrigger = target.closest<HTMLElement>(
    "#openDrawerBtn, #muMenuBtn, #tetrToggleBtn, #nsMobileToggle, #niatToggleBtn, .hamburger-btn, .hamburger-toggle-btn, [data-xite-drawer-toggle]"
  );
  if (drawerOpenTrigger) {
    event.preventDefault();
    event.stopPropagation();

    const section =
      drawerOpenTrigger.closest<HTMLElement>("[data-xite-section], header, .section-wrapper-container, section") ||
      document.body;
    const drawer =
      section.querySelector<HTMLElement>(
        "#mobileDrawer, #muMobileDrawer, #tetrMobileDrawer, #nsMobileDrawer, #niatMobileDrawer, .mobile-drawer, .mobile-drawer-menu"
      ) ||
      document.getElementById("mobileDrawer") ||
      document.getElementById("muMobileDrawer") ||
      document.getElementById("tetrMobileDrawer") ||
      document.getElementById("nsMobileDrawer") ||
      document.getElementById("niatMobileDrawer");

    if (drawer) {
      drawer.classList.toggle("active");
      drawer.classList.toggle("open");
    }
    return true;
  }

  const drawerCloseTrigger = target.closest<HTMLElement>(
    "#closeDrawerBtn, #muCloseBtn, #tetrCloseBtn, #nsDrawerClose, #niatCloseBtn, .drawer-close-btn, .mobile-drawer-close"
  );
  if (drawerCloseTrigger) {
    event.preventDefault();
    event.stopPropagation();

    const section =
      drawerCloseTrigger.closest<HTMLElement>("[data-xite-section], header, .section-wrapper-container, section") ||
      document.body;
    const drawer =
      section.querySelector<HTMLElement>(
        "#mobileDrawer, #muMobileDrawer, #tetrMobileDrawer, #nsMobileDrawer, #niatMobileDrawer, .mobile-drawer, .mobile-drawer-menu"
      ) ||
      document.getElementById("mobileDrawer") ||
      document.getElementById("muMobileDrawer") ||
      document.getElementById("tetrMobileDrawer") ||
      document.getElementById("nsMobileDrawer") ||
      document.getElementById("niatMobileDrawer");

    if (drawer) {
      drawer.classList.remove("active", "open");
    }
    return true;
  }

  // 3. Mobile Accordion & Drawer Accordion Toggles
  const drawerAccBtn = target.closest<HTMLElement>(
    ".drawer-accordion-btn, .ns-accordion-btn, .niat-acc-btn, .lit-m-acc-btn, .mu-accordion-header"
  );
  if (drawerAccBtn) {
    event.preventDefault();
    event.stopPropagation();

    const parent =
      drawerAccBtn.closest<HTMLElement>(".drawer-accordion") ||
      drawerAccBtn.closest<HTMLElement>(".ns-accordion-item") ||
      drawerAccBtn.closest<HTMLElement>(".niat-accordion-item") ||
      drawerAccBtn.closest<HTMLElement>(".lit-m-accordion") ||
      drawerAccBtn.closest<HTMLElement>(".mu-accordion-item");

    if (parent) {
      const isOpen = parent.classList.contains("open") || parent.classList.contains("expanded");
      const body = parent.querySelector<HTMLElement>(
        ".drawer-accordion-body, .ns-accordion-body, .niat-accordion-body, .accordion-body, .mu-accordion-content"
      );

      const container = parent.parentElement;
      if (container) {
        container
          .querySelectorAll<HTMLElement>(
            ".drawer-accordion, .ns-accordion-item, .niat-accordion-item, .lit-m-accordion"
          )
          .forEach((acc) => {
            if (acc !== parent) {
              acc.classList.remove("open", "expanded");
              const b = acc.querySelector<HTMLElement>(
                ".drawer-accordion-body, .ns-accordion-body, .niat-accordion-body"
              );
              if (b) b.style.maxHeight = "";
            }
          });
      }

      if (isOpen) {
        parent.classList.remove("open", "expanded");
        if (body) body.style.maxHeight = "";
      } else {
        parent.classList.add("open", "expanded");
        if (body) body.style.maxHeight = `${body.scrollHeight || 300}px`;
      }
    }
    return true;
  }

  // 4. FAQ & Card Accordion Expander Toggles
  const faqTrigger = target.closest<HTMLElement>(
    ".faq-trigger, .px-card-trigger, .accordion-trigger, .faq-header, .accordion-header"
  );
  if (faqTrigger) {
    event.preventDefault();
    event.stopPropagation();

    const item =
      faqTrigger.closest<HTMLElement>(".faq-item") ||
      faqTrigger.closest<HTMLElement>(".px-card") ||
      faqTrigger.closest<HTMLElement>(".faq-card") ||
      faqTrigger.closest<HTMLElement>(".accordion-card") ||
      faqTrigger.closest<HTMLElement>(".accordion-item");

    if (item) {
      const isOpen = item.classList.contains("open") || item.classList.contains("active");
      const content = item.querySelector<HTMLElement>(
        ".faq-content, .faq-answer, .px-card-body, .accordion-content, .faq-body"
      );

      if (isOpen) {
        item.classList.remove("open", "active");
        if (content) content.style.maxHeight = "";
      } else {
        item.classList.add("open", "active");
        if (content) content.style.maxHeight = `${content.scrollHeight || 200}px`;
      }
    }
    return true;
  }

  // 5. Tabs Switcher (FAQ / Gallery / Categories / Academics)
  const tabBtn = target.closest<HTMLElement>(
    ".tab-btn, .cr-nav-btn, .edu-tab-btn, .faq-tab-btn, [data-tab-target], [data-tab]"
  );
  if (tabBtn) {
    event.preventDefault();
    event.stopPropagation();

    const navContainer = tabBtn.parentElement;
    const section =
      tabBtn.closest<HTMLElement>("[data-xite-section], .section-wrapper-container, section") ||
      document.body;

    if (navContainer) {
      const allTabs = Array.from(
        navContainer.querySelectorAll<HTMLElement>(
          ".tab-btn, .cr-nav-btn, .edu-tab-btn, .faq-tab-btn, [data-tab-target], [data-tab]"
        )
      );
      const activeIdx = allTabs.indexOf(tabBtn);

      allTabs.forEach((btn) => btn.classList.remove("active", "active-tab"));
      tabBtn.classList.add("active", "active-tab");

      const targetTabKey =
        tabBtn.getAttribute("data-tab") ||
        tabBtn.getAttribute("data-tab-target") ||
        tabBtn.getAttribute("data-category");
      const allPanels = Array.from(
        section.querySelectorAll<HTMLElement>(
          ".tab-panel, .cr-faq-panel, .edu-panel, .faq-panel, [data-tab-panel]"
        )
      );

      allPanels.forEach((p, idx) => {
        const panelKey =
          p.getAttribute("data-tab") ||
          p.getAttribute("data-tab-panel") ||
          p.getAttribute("data-category") ||
          p.id;
        if (targetTabKey && (panelKey === targetTabKey || p.id.includes(targetTabKey))) {
          p.classList.add("active");
          p.style.display = "";
        } else if (!targetTabKey && idx === activeIdx) {
          p.classList.add("active");
          p.style.display = "";
        } else if (targetTabKey || activeIdx >= 0) {
          p.classList.remove("active");
        }
      });
    }
    return true;
  }

  // 6. Smooth Back-to-Top Button
  const backToTopBtn = target.closest<HTMLElement>(
    "#pennBackToTop, #uwaBackToTop, .back-to-top-btn, [data-back-to-top]"
  );
  if (backToTopBtn) {
    event.preventDefault();
    event.stopPropagation();
    window.scrollTo({ top: 0, behavior: "smooth" });
    return true;
  }

  // 7. Click Outside Header / Dropdown handler: Closes open mega-menus
  const headerContainer = target.closest<HTMLElement>(
    ".mesa-header, .niat-header, .mu-header, .ns-header, .sc-header, .lit-header, header"
  );
  if (!headerContainer) {
    let closedAny = false;
    document.querySelectorAll<HTMLElement>(".nav-item.open").forEach((el) => {
      el.classList.remove("open");
      closedAny = true;
    });
    document.querySelectorAll<HTMLElement>(".mega-menu.active").forEach((el) => {
      el.classList.remove("active");
      closedAny = true;
    });
    document.querySelectorAll<HTMLElement>(".has-drop.active-open, .has-drop.open").forEach((el) => {
      el.classList.remove("active-open", "open");
      closedAny = true;
    });
    document.querySelectorAll<HTMLElement>("#niatDropdownWrapper").forEach((el) => {
      if (el.style.display !== "none") {
        el.style.display = "none";
        closedAny = true;
      }
    });
    document.querySelectorAll<HTMLElement>(".niat-panel.active").forEach((el) => {
      el.classList.remove("active");
      closedAny = true;
    });
    if (closedAny) return true;
  }

  return false;
}
