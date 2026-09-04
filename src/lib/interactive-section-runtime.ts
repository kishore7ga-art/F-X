/**
 * Interactive Section Runtime Delegator
 *
 * Ensures all interactive navbar mega-menus, dropdown lists, mobile drawers,
 * accordion toggles, FAQ expanders, tabs, video modals, chat widgets,
 * draggable slider tracks, and action buttons work natively and
 * interactively in both the Editor Studio canvas and the Published Site Viewer,
 * matching the isolated iframe preview experience in the Admin Studio.
 */

function getTargetDoc(target?: EventTarget | HTMLElement | null): Document | null {
  if (target && typeof target === "object" && "ownerDocument" in target && (target as HTMLElement).ownerDocument) {
    return (target as HTMLElement).ownerDocument;
  }
  if (typeof document !== "undefined") {
    return document;
  }
  return null;
}

export function handleInteractiveSectionClick(event: MouseEvent | React.MouseEvent): boolean {
  const target = event.target as HTMLElement | null;
  if (!target) return false;

  const doc = getTargetDoc(target);

  // 1. Desktop Mega-Menu & Dropdown Navigation (Mesa / Newton / NIAT / Masters' Union / Literati / Seoul patterns)
  const navTrigger = target.closest<HTMLElement>(
    ".nav-trigger, .nav-item[data-menu], .has-drop, .has-dropdown, .niat-nav-btn, .ns-dropdown-btn, .sc-dropdown-btn, .dropdown-toggle, #litProgramsBtn, .sc-dropdown-btn, .tetr-dropdown-btn, [data-menu], [data-panel]"
  );

  if (navTrigger) {
    const navItem =
      target.closest<HTMLElement>(".nav-item[data-menu]") ||
      target.closest<HTMLElement>(".nav-item") ||
      target.closest<HTMLElement>(".has-drop") ||
      target.closest<HTMLElement>(".has-dropdown") ||
      target.closest<HTMLElement>("[data-panel]") ||
      target.closest<HTMLElement>("#litDropWrap") ||
      target.closest<HTMLElement>("#scProgramsDropdown") ||
      navTrigger;

    const section =
      navTrigger.closest<HTMLElement>("[data-xite-section], header, .section-wrapper-container, section") ||
      doc?.body ||
      null;

    // A. Mesa Mega Menu pattern (.nav-item[data-menu] -> #menu-{key})
    const menuKey = navItem?.getAttribute("data-menu") || navTrigger.getAttribute("data-menu");
    if (menuKey) {
      event.preventDefault();
      event.stopPropagation();

      const isOpen = navItem?.classList.contains("open") ?? false;
      const targetMenu =
        section?.querySelector<HTMLElement>(`#menu-${menuKey}`) ||
        doc?.getElementById(`menu-${menuKey}`) ||
        section?.querySelector<HTMLElement>(`.mega-menu[data-menu="${menuKey}"]`);

      // Close other open nav items & mega menus in this section
      section?.querySelectorAll<HTMLElement>(".nav-item.open").forEach((el) => el.classList.remove("open"));
      section?.querySelectorAll<HTMLElement>(".mega-menu.active").forEach((el) => el.classList.remove("active"));

      if (!isOpen && navItem) {
        navItem.classList.add("open");
        if (targetMenu) {
          targetMenu.classList.add("active");
        }
      }
      return true;
    }

    // B. Literati & Seoul Programs Dropdown pattern (#litProgramsBtn / #scProgramsDropdown)
    const litMegaContainer = section?.querySelector<HTMLElement>("#litMegaContainer") || doc?.getElementById("litMegaContainer");
    const litDropWrap = section?.querySelector<HTMLElement>("#litDropWrap") || doc?.getElementById("litDropWrap");
    if (target.closest("#litProgramsBtn") || navTrigger.id === "litProgramsBtn") {
      event.preventDefault();
      event.stopPropagation();
      const isMegaOpen = litMegaContainer?.classList.contains("open");
      if (isMegaOpen) {
        litMegaContainer?.classList.remove("open");
        litDropWrap?.classList.remove("active-open");
      } else {
        litMegaContainer?.classList.add("open");
        litDropWrap?.classList.add("active-open");
      }
      return true;
    }

    const scDropdown = target.closest<HTMLElement>("#scProgramsDropdown, .sc-dropdown-btn");
    if (scDropdown) {
      event.preventDefault();
      event.stopPropagation();
      const scItem = section?.querySelector<HTMLElement>("#scProgramsDropdown") || scDropdown;
      const scMenu = section?.querySelector<HTMLElement>(".sc-mega-wrapper, .sc-dropdown-menu");
      const isScOpen = scItem.classList.contains("active") || scItem.classList.contains("open");
      if (isScOpen) {
        scItem.classList.remove("active", "open");
        scMenu?.classList.remove("active", "open");
      } else {
        scItem.classList.add("active", "open");
        scMenu?.classList.add("active", "open");
      }
      return true;
    }

    // C. NIAT Panel pattern (data-panel -> #panel-{panelId} & #niatDropdownWrapper)
    const panelId = navItem?.getAttribute("data-panel") || navTrigger.getAttribute("data-panel");
    if (panelId) {
      event.preventDefault();
      event.stopPropagation();

      const dropdownWrapper =
        section?.querySelector<HTMLElement>("#niatDropdownWrapper") ||
        section?.querySelector<HTMLElement>(".dropdown-wrapper") ||
        doc?.getElementById("niatDropdownWrapper");

      const targetPanel =
        section?.querySelector<HTMLElement>(`#panel-${panelId}`) ||
        doc?.getElementById(`panel-${panelId}`);

      const dropItems = section?.querySelectorAll<HTMLElement>(".has-drop, [data-panel]") || [];
      const panels = section?.querySelectorAll<HTMLElement>(".niat-panel, .dropdown-panel") || [];

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

    // D. Generic Dropdown toggle (.has-drop / .has-dropdown / .dropdown-toggle / .wx-dropdown-toggle)
    if (
      navItem &&
      (navItem.classList.contains("has-drop") ||
        navItem.classList.contains("has-dropdown") ||
        navItem.classList.contains("dropdown") ||
        navItem.classList.contains("wx-dropdown-toggle") ||
        navTrigger.classList.contains("wx-dropdown-toggle"))
    ) {
      event.preventDefault();
      event.stopPropagation();

      const isOpen = navItem.classList.contains("open") || navItem.classList.contains("active");
      const dropItems = section?.querySelectorAll<HTMLElement>(".has-drop, .has-dropdown, .dropdown, .wx-dropdown") || [];
      dropItems.forEach((el) => el.classList.remove("open", "active"));

      if (!isOpen) {
        navItem.classList.add("open", "active");
        const subMenu = navItem.querySelector<HTMLElement>(".dropdown-menu, .sub-menu, .mega-menu, .wx-dropdown-menu");
        if (subMenu) subMenu.classList.add("active", "open");
      }
      return true;
    }
  }

  // 2. Mobile Navigation Drawers (Open & Close)
  const drawerOpenTrigger = target.closest<HTMLElement>(
    "#openDrawerBtn, #muMenuBtn, #tetrToggleBtn, #nsMobileToggle, #niatToggleBtn, #scMenuBtn, #litBurgerBtn, .hamburger-btn, .hamburger-toggle-btn, .wx-mobile-menu-toggle, [data-xite-drawer-toggle]"
  );
  if (drawerOpenTrigger) {
    event.preventDefault();
    event.stopPropagation();

    const section =
      drawerOpenTrigger.closest<HTMLElement>("[data-xite-section], header, .section-wrapper-container, section") ||
      doc?.body ||
      null;
    const drawer =
      section?.querySelector<HTMLElement>(
        "#mobileDrawer, #muMobileDrawer, #tetrMobileDrawer, #nsMobileDrawer, #niatMobileDrawer, #scMobileDrawer, #litMobileDrawer, .mobile-drawer, .mobile-drawer-menu"
      ) ||
      doc?.getElementById("mobileDrawer") ||
      doc?.getElementById("muMobileDrawer") ||
      doc?.getElementById("tetrMobileDrawer") ||
      doc?.getElementById("nsMobileDrawer") ||
      doc?.getElementById("niatMobileDrawer") ||
      doc?.getElementById("scMobileDrawer") ||
      doc?.getElementById("litMobileDrawer");

    if (drawer) {
      drawer.classList.toggle("active");
      drawer.classList.toggle("open");
    }
    return true;
  }

  const drawerCloseTrigger = target.closest<HTMLElement>(
    "#closeDrawerBtn, #muCloseBtn, #tetrCloseBtn, #nsDrawerClose, #niatCloseBtn, #scCloseBtn, #litCloseBtn, .drawer-close-btn, .mobile-drawer-close"
  );
  if (drawerCloseTrigger) {
    event.preventDefault();
    event.stopPropagation();

    const section =
      drawerCloseTrigger.closest<HTMLElement>("[data-xite-section], header, .section-wrapper-container, section") ||
      doc?.body ||
      null;
    const drawer =
      section?.querySelector<HTMLElement>(
        "#mobileDrawer, #muMobileDrawer, #tetrMobileDrawer, #nsMobileDrawer, #niatMobileDrawer, #scMobileDrawer, #litMobileDrawer, .mobile-drawer, .mobile-drawer-menu"
      ) ||
      doc?.getElementById("mobileDrawer") ||
      doc?.getElementById("muMobileDrawer") ||
      doc?.getElementById("tetrMobileDrawer") ||
      doc?.getElementById("nsMobileDrawer") ||
      doc?.getElementById("niatMobileDrawer") ||
      doc?.getElementById("scMobileDrawer") ||
      doc?.getElementById("litMobileDrawer");

    if (drawer) {
      drawer.classList.remove("active", "open");
    }
    return true;
  }

  // 3. Mobile Accordion & Drawer Accordion Toggles
  const drawerAccBtn = target.closest<HTMLElement>(
    ".drawer-accordion-btn, .ns-accordion-btn, .niat-acc-btn, .lit-m-acc-btn, .sc-m-acc-btn, .mu-accordion-header, .mu-accordion-btn"
  );
  if (drawerAccBtn) {
    event.preventDefault();
    event.stopPropagation();

    const parent =
      drawerAccBtn.closest<HTMLElement>(".drawer-accordion") ||
      drawerAccBtn.closest<HTMLElement>(".ns-accordion-item") ||
      drawerAccBtn.closest<HTMLElement>(".niat-accordion-item") ||
      drawerAccBtn.closest<HTMLElement>(".lit-m-accordion") ||
      drawerAccBtn.closest<HTMLElement>("#scMobileAccordion") ||
      drawerAccBtn.closest<HTMLElement>(".mu-accordion-item");

    if (parent) {
      const isOpen = parent.classList.contains("open") || parent.classList.contains("expanded");
      const body = parent.querySelector<HTMLElement>(
        ".drawer-accordion-body, .ns-accordion-body, .niat-accordion-body, .accordion-body, .mu-accordion-content, .sc-m-acc-body"
      );

      // Optional: close other accordions in the same drawer
      const container = parent.parentElement;
      if (container) {
        container
          .querySelectorAll<HTMLElement>(
            ".drawer-accordion, .ns-accordion-item, .niat-accordion-item, .lit-m-accordion, #scMobileAccordion"
          )
          .forEach((acc) => {
            if (acc !== parent) {
              acc.classList.remove("open", "expanded");
              const b = acc.querySelector<HTMLElement>(
                ".drawer-accordion-body, .ns-accordion-body, .niat-accordion-body, .accordion-body, .sc-m-acc-body"
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

  // 4. FAQ & Card Accordion Expander Toggles (all categories)
  const faqTrigger = target.closest<HTMLElement>(
    ".faq-trigger, .px-card-trigger, .accordion-trigger, .cr-trigger, .faq-header, .accordion-header"
  );
  if (faqTrigger) {
    event.preventDefault();
    event.stopPropagation();

    const item =
      faqTrigger.closest<HTMLElement>(".faq-item") ||
      faqTrigger.closest<HTMLElement>(".px-card") ||
      faqTrigger.closest<HTMLElement>(".faq-card") ||
      faqTrigger.closest<HTMLElement>(".accordion-card") ||
      faqTrigger.closest<HTMLElement>(".accordion-item") ||
      faqTrigger.closest<HTMLElement>(".cr-accordion-item");

    if (item) {
      const isOpen = item.classList.contains("open") || item.classList.contains("active");
      const content = item.querySelector<HTMLElement>(
        ".faq-content, .faq-answer, .px-card-body, .accordion-content, .accordion-body, .cr-content, .faq-body"
      );

      // Close other accordion items in the same list if single-open
      const parentList = item.parentElement;
      if (parentList) {
        parentList.querySelectorAll<HTMLElement>(".faq-item, .px-card, .faq-card, .accordion-card, .cr-accordion-item, .accordion-item").forEach((other) => {
          if (other !== item) {
            other.classList.remove("open", "active");
            const c = other.querySelector<HTMLElement>(".faq-content, .faq-answer, .px-card-body, .accordion-content, .accordion-body, .cr-content, .faq-body");
            if (c) c.style.maxHeight = "";
          }
        });
      }

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
      doc?.body ||
      null;

    if (navContainer && section) {
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

      // A. FAQ category filter switching (faq-tab-btn with faq-item[data-category])
      if (tabBtn.classList.contains("faq-tab-btn")) {
        const faqItems = section.querySelectorAll<HTMLElement>(".faq-item");
        faqItems.forEach((f) => {
          const itemCats = f.getAttribute("data-category") || "";
          if (targetTabKey === "general" || targetTabKey === "all" || !targetTabKey || itemCats.includes(targetTabKey)) {
            f.style.display = "";
          } else {
            f.style.display = "none";
            f.classList.remove("open");
          }
        });
        return true;
      }

      // B. Tab panels switching
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
        const targetId = targetTabKey ? `tab-${targetTabKey}` : "";
        if (
          targetTabKey &&
          (panelKey === targetTabKey || p.id === targetId || p.id === targetTabKey || p.id.includes(targetTabKey))
        ) {
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

  // 6. Video Modal Lightbox & Reels (Gallery & Hero)
  const reelCard = target.closest<HTMLElement>(".reel-card, [data-video], .play-button, .tour-play-btn, .mesa-play-btn, .play-overlay-trigger");
  if (reelCard) {
    const videoSrc = reelCard.getAttribute("data-video") || reelCard.getAttribute("data-src");
    const section = reelCard.closest<HTMLElement>("[data-xite-section], .section-wrapper-container, section") || doc?.body || null;
    const modal = section?.querySelector<HTMLElement>("#videoModal, .video-modal") || doc?.getElementById("videoModal");
    const videoPlayer = (section?.querySelector<HTMLElement>("#modalVideoPlayer, .modal-video") || doc?.getElementById("modalVideoPlayer")) as HTMLVideoElement | null;

    if (modal) {
      event.preventDefault();
      event.stopPropagation();
      if (videoSrc && videoPlayer) {
        videoPlayer.src = videoSrc;
        videoPlayer.play?.().catch?.(() => {});
      }
      modal.classList.add("active", "open");
      return true;
    }
  }

  const modalCloseTrigger = target.closest<HTMLElement>("#closeModalBtn, .close-modal-btn, .modal-close, [data-modal-close]");
  if (modalCloseTrigger) {
    const modal = modalCloseTrigger.closest<HTMLElement>("#videoModal, .video-modal") || doc?.getElementById("videoModal");
    const videoPlayer = (modal?.querySelector<HTMLElement>("#modalVideoPlayer, .modal-video") || doc?.getElementById("modalVideoPlayer")) as HTMLVideoElement | null;

    if (modal) {
      event.preventDefault();
      event.stopPropagation();
      modal.classList.remove("active", "open");
      if (videoPlayer) {
        videoPlayer.pause?.();
        videoPlayer.currentTime = 0;
      }
      return true;
    }
  }

  // 7. FAQ Interactive Chat Widget & Drawer
  const chatOpenBtn = target.closest<HTMLElement>("#faqChatBtn, #faqTeamTrigger, .chat-trigger-btn");
  if (chatOpenBtn) {
    event.preventDefault();
    event.stopPropagation();
    const section = chatOpenBtn.closest<HTMLElement>("[data-xite-section], .section-wrapper-container, section") || doc?.body || null;
    const chatDrawer = section?.querySelector<HTMLElement>("#chatDrawer, .chat-drawer") || doc?.getElementById("chatDrawer");
    const chatInput = (section?.querySelector<HTMLElement>("#chatInput") || doc?.getElementById("chatInput")) as HTMLInputElement | null;

    if (chatDrawer) {
      chatDrawer.classList.toggle("active");
      if (chatDrawer.classList.contains("active") && chatInput) {
        setTimeout(() => chatInput.focus(), 250);
      }
      return true;
    }
  }

  const chatCloseBtn = target.closest<HTMLElement>("#chatCloseBtn, .chat-close-btn");
  if (chatCloseBtn) {
    event.preventDefault();
    event.stopPropagation();
    const chatDrawer = chatCloseBtn.closest<HTMLElement>("#chatDrawer, .chat-drawer") || doc?.getElementById("chatDrawer");
    if (chatDrawer) {
      chatDrawer.classList.remove("active");
      return true;
    }
  }

  // 8. Toast & Action Notification Buttons (#browseFaqBtn, #quToast, etc.)
  const browseFaqBtn = target.closest<HTMLElement>("#browseFaqBtn, .faq-action-btn");
  if (browseFaqBtn) {
    event.preventDefault();
    event.stopPropagation();
    const toast = doc?.getElementById("quToast") || doc?.querySelector<HTMLElement>(".toast-notification");
    if (toast) {
      toast.textContent = "Navigating to Help Center documentation...";
      toast.classList.add("active", "show");
      setTimeout(() => toast.classList.remove("active", "show"), 2500);
    }
    return true;
  }

  // 9. Smooth Back-to-Top Button
  const backToTopBtn = target.closest<HTMLElement>(
    "#pennBackToTop, #uwaBackToTop, .back-to-top-btn, [data-back-to-top]"
  );
  if (backToTopBtn) {
    event.preventDefault();
    event.stopPropagation();
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    return true;
  }

  // 10. Click Outside Header / Dropdown handler: Closes open mega-menus and video modals
  const headerContainer = target.closest<HTMLElement>(
    ".mesa-header, .niat-header, .mu-header, .ns-header, .sc-header, .lit-header, header"
  );
  if (!headerContainer && doc) {
    let closedAny = false;
    doc.querySelectorAll<HTMLElement>(".nav-item.open").forEach((el) => {
      el.classList.remove("open");
      closedAny = true;
    });
    doc.querySelectorAll<HTMLElement>(".mega-menu.active").forEach((el) => {
      el.classList.remove("active");
      closedAny = true;
    });
    doc.querySelectorAll<HTMLElement>("#litMegaContainer.open").forEach((el) => {
      el.classList.remove("open");
      closedAny = true;
    });
    doc.querySelectorAll<HTMLElement>("#litDropWrap.active-open").forEach((el) => {
      el.classList.remove("active-open");
      closedAny = true;
    });
    doc.querySelectorAll<HTMLElement>(".has-drop.active-open, .has-drop.open").forEach((el) => {
      el.classList.remove("active-open", "open");
      closedAny = true;
    });
    doc.querySelectorAll<HTMLElement>("#niatDropdownWrapper").forEach((el) => {
      if (el.style.display !== "none") {
        el.style.display = "none";
        closedAny = true;
      }
    });
    doc.querySelectorAll<HTMLElement>(".niat-panel.active").forEach((el) => {
      el.classList.remove("active");
      closedAny = true;
    });
    if (closedAny) return true;
  }

  return false;
}

/**
 * Attaches continuous listeners for drag-to-scroll tracks and chat forms
 */
export function attachInteractiveSectionListeners(container?: Document | HTMLElement | null): () => void {
  const targetContainer = container ?? (typeof document !== "undefined" ? document : null);
  if (!targetContainer || typeof window === "undefined") {
    return () => {};
  }

  let isDraggingTrack = false;
  let startTrackX = 0;
  let startScrollLeft = 0;
  let activeTrack: HTMLElement | null = null;

  const onMouseDown = (e: MouseEvent) => {
    const track = (e.target as HTMLElement | null)?.closest<HTMLElement>(
      "#reelsTrack, #galleryTrack, .reels-track, .gallery-track, .slider-track, .reels-slider-wrapper"
    );
    if (track) {
      isDraggingTrack = true;
      activeTrack = track;
      startTrackX = e.pageX - track.offsetLeft;
      startScrollLeft = track.scrollLeft;
    }
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDraggingTrack || !activeTrack) return;
    e.preventDefault();
    const x = e.pageX - activeTrack.offsetLeft;
    const walk = (x - startTrackX) * 1.5;
    activeTrack.scrollLeft = startScrollLeft - walk;
  };

  const onMouseUp = () => {
    isDraggingTrack = false;
    activeTrack = null;
  };

  const onSubmit = (e: SubmitEvent) => {
    const form = (e.target as HTMLElement | null)?.closest<HTMLFormElement>("#chatForm, .chat-form");
    if (form) {
      e.preventDefault();
      const input = form.querySelector<HTMLInputElement>("#chatInput, input[type='text'], input");
      const doc = getTargetDoc(form);
      const messages = form.parentElement?.querySelector<HTMLElement>("#chatMessages, .chat-messages") || doc?.getElementById("chatMessages");
      const text = input?.value.trim();
      if (!text || !messages || !doc) return;

      const userBubble = doc.createElement("div");
      userBubble.className = "chat-bubble user";
      userBubble.textContent = text;
      userBubble.style.cssText = "align-self: flex-end; background: #2563eb; color: #fff; padding: 8px 14px; border-radius: 16px 16px 2px 16px; margin-bottom: 8px; max-width: 80%; font-size: 13px;";
      messages.appendChild(userBubble);
      if (input) input.value = "";
      messages.scrollTop = messages.scrollHeight;

      setTimeout(() => {
        const botBubble = doc.createElement("div");
        botBubble.className = "chat-bubble bot";
        botBubble.textContent = "Thanks for reaching out! Our team is reviewing your question and will respond right here.";
        botBubble.style.cssText = "align-self: flex-start; background: rgba(255,255,255,0.1); color: #fff; padding: 8px 14px; border-radius: 16px 16px 16px 2px; margin-bottom: 8px; max-width: 80%; font-size: 13px;";
        messages.appendChild(botBubble);
        messages.scrollTop = messages.scrollHeight;
      }, 700);
    }
  };

  targetContainer.addEventListener("mousedown", onMouseDown as EventListener);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
  targetContainer.addEventListener("submit", onSubmit as EventListener);

  return () => {
    targetContainer.removeEventListener("mousedown", onMouseDown as EventListener);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
    targetContainer.removeEventListener("submit", onSubmit as EventListener);
  };
}

